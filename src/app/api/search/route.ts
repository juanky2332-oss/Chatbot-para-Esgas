import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Normalise reference: uppercase, strip spaces/dashes/dots/slashes
function norm(s: string): string {
  return s.toUpperCase().replace(/[\s\-./]/g, '');
}

interface SearchResult {
  tipo: string;
  skf?: string | null;
  fag?: string | null;
  nsk?: string | null;
  ref_ntn?: string;
  marca?: string | null;
  ean?: string | null;
  descripcion?: string | null;
  aplicaciones?: string | null;
}

async function searchByReference(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  const qNorm = norm(q);
  const results: SearchResult[] = [];

  // 1. Search equivalencias (other brands → NTN/SNR)
  //    Try exact match on each brand column via ilike (case-insensitive)
  const { data: eqData } = await supabase
    .from('equivalencias')
    .select('skf, fag, nsk, ref_ntn, marca, ean')
    .or(`skf.ilike.%${q}%,fag.ilike.%${q}%,nsk.ilike.%${q}%`)
    .limit(8);

  if (eqData && eqData.length > 0) {
    // Sort: exact matches first, then partial
    const sorted = eqData.sort((a, b) => {
      const aExact = [a.skf, a.fag, a.nsk].some(v => v && norm(v) === qNorm) ? 0 : 1;
      const bExact = [b.skf, b.fag, b.nsk].some(v => v && norm(v) === qNorm) ? 0 : 1;
      return aExact - bExact;
    });

    for (const eq of sorted.slice(0, 5)) {
      // Enrich with product description
      const { data: prod } = await supabase
        .from('productos')
        .select('descripcion, aplicaciones')
        .ilike('ref', eq.ref_ntn)
        .limit(1)
        .single();

      results.push({
        tipo: 'equivalencia',
        skf: eq.skf,
        fag: eq.fag,
        nsk: eq.nsk,
        ref_ntn: eq.ref_ntn,
        marca: eq.marca,
        ean: eq.ean,
        descripcion: prod?.descripcion ?? null,
        aplicaciones: prod?.aplicaciones ?? null,
      });
    }
  }

  // 2. Also search directly in productos by NTN/SNR reference
  if (results.length < 3) {
    const { data: prodData } = await supabase
      .from('productos')
      .select('marca, ref, ean, descripcion, aplicaciones')
      .ilike('ref', `%${q}%`)
      .limit(5);

    if (prodData) {
      for (const p of prodData) {
        const alreadyFound = results.some(r => r.ref_ntn === p.ref);
        if (!alreadyFound) {
          results.push({
            tipo: 'producto',
            ref_ntn: p.ref,
            marca: p.marca,
            ean: p.ean,
            descripcion: p.descripcion,
            aplicaciones: p.aplicaciones,
          });
        }
      }
    }
  }

  return results.slice(0, 5);
}

async function searchByKeyword(query: string): Promise<SearchResult[]> {
  const q = query.trim();

  // Full-text search on productos
  const { data: ftsData } = await supabase
    .from('productos')
    .select('marca, ref, ean, descripcion, aplicaciones')
    .textSearch('search_vector', q, { type: 'websearch', config: 'spanish' })
    .limit(5);

  if (ftsData && ftsData.length > 0) {
    return ftsData.map(p => ({
      tipo: 'producto',
      ref_ntn: p.ref,
      marca: p.marca,
      ean: p.ean,
      descripcion: p.descripcion,
      aplicaciones: p.aplicaciones,
    }));
  }

  // Fallback: simple ilike on descripcion
  const { data: likeData } = await supabase
    .from('productos')
    .select('marca, ref, ean, descripcion, aplicaciones')
    .ilike('descripcion', `%${q}%`)
    .limit(5);

  return (likeData ?? []).map(p => ({
    tipo: 'producto',
    ref_ntn: p.ref,
    marca: p.marca,
    ean: p.ean,
    descripcion: p.descripcion,
    aplicaciones: p.aplicaciones,
  }));
}

// Heuristic: looks like a bearing reference (has digits, short-ish)
function looksLikeReference(q: string): boolean {
  return /\d{3,}/.test(q) && q.length < 30;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body as { query: string };

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query required' }, { status: 400 });
    }

    const q = query.trim().slice(0, 150);
    const results = looksLikeReference(q)
      ? await searchByReference(q)
      : await searchByKeyword(q);

    // If reference search found nothing, also try keyword
    const finalResults =
      results.length === 0 && looksLikeReference(q)
        ? await searchByKeyword(q)
        : results;

    return NextResponse.json({
      query: q,
      total: finalResults.length,
      results: finalResults,
    });
  } catch (err) {
    console.error('[search]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (!q) return NextResponse.json({ error: 'q param required' }, { status: 400 });
  return POST(new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify({ query: q }),
    headers: { 'Content-Type': 'application/json' },
  }));
}
