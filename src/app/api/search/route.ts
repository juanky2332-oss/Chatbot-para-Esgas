import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

// ── Normalise: uppercase, strip spaces/dashes/dots/slashes ────────────────────
function norm(s: string): string {
  return String(s).toUpperCase().replace(/[\s\-./]/g, '');
}

// Extract the numeric core of a reference: "6205 ZZ C3" → "6205", "32212U" → "32212"
function numericCore(q: string): string {
  const m = q.match(/\d{4,}/);
  return m ? m[0] : '';
}

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Enrich equivalencia with product description ──────────────────────────────
async function enrichEquivalencia(eq: {
  skf: string; fag: string; nsk: string; ref_ntn: string; marca: string; ean: string;
}): Promise<SearchResult> {
  const supabase = getSupabase();
  const { data: prod } = await supabase
    .from('productos')
    .select('descripcion, aplicaciones')
    .ilike('ref', eq.ref_ntn)
    .limit(1)
    .maybeSingle();

  return {
    tipo: 'equivalencia',
    skf: eq.skf || null,
    fag: eq.fag || null,
    nsk: eq.nsk || null,
    ref_ntn: eq.ref_ntn,
    marca: eq.marca || null,
    ean: eq.ean || null,
    descripcion: prod?.descripcion ?? null,
    aplicaciones: prod?.aplicaciones ?? null,
  };
}

// ── Score a row against the normalised query ──────────────────────────────────
function score(row: Record<string, string>, qNorm: string): number {
  const fields = ['skf', 'fag', 'nsk', 'ref_ntn', 'ref'].map(k => norm(row[k] || ''));
  if (fields.some(f => f === qNorm)) return 3;            // exact
  if (fields.some(f => f.startsWith(qNorm) || qNorm.startsWith(f))) return 2; // prefix
  if (fields.some(f => f.includes(qNorm))) return 1;      // contains
  return 0;
}

// ── Main reference search ─────────────────────────────────────────────────────
async function searchByReference(query: string): Promise<SearchResult[]> {
  const supabase = getSupabase();
  const q = query.trim();
  const qNorm = norm(q);
  const core = numericCore(q); // e.g. "6205"

  // Build OR filter: try full query + numeric core against all brand columns
  const patterns = [q];
  if (core && core !== q) patterns.push(core);

  const orFilters = patterns.flatMap(p => [
    `skf.ilike.%${p}%`,
    `fag.ilike.%${p}%`,
    `nsk.ilike.%${p}%`,
    `ref_ntn.ilike.%${p}%`,
  ]).join(',');

  const { data: eqData } = await supabase
    .from('equivalencias')
    .select('skf, fag, nsk, ref_ntn, marca, ean')
    .or(orFilters)
    .limit(20);

  const results: SearchResult[] = [];

  if (eqData && eqData.length > 0) {
    // Score and sort: exact match > prefix > core match
    const scored = eqData
      .map(row => ({ row, s: score(row as Record<string, string>, qNorm) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5);

    for (const { row } of scored) {
      results.push(await enrichEquivalencia(row as {
        skf: string; fag: string; nsk: string; ref_ntn: string; marca: string; ean: string;
      }));
    }
  }

  // Also search productos directly (user may have typed an NTN ref)
  if (results.length < 3) {
    const prodPatterns = patterns.flatMap(p => [`ref.ilike.%${p}%`]).join(',');
    const { data: prodData } = await supabase
      .from('productos')
      .select('marca, ref, ean, descripcion, aplicaciones')
      .or(prodPatterns)
      .limit(10);

    if (prodData) {
      const scored = prodData
        .map(row => ({ row, s: score(row as Record<string, string>, qNorm) }))
        .sort((a, b) => b.s - a.s);

      for (const { row: p } of scored) {
        if (!results.some(r => r.ref_ntn === p.ref)) {
          results.push({
            tipo: 'producto',
            ref_ntn: p.ref,
            marca: p.marca,
            ean: p.ean,
            descripcion: p.descripcion,
            aplicaciones: p.aplicaciones,
          });
        }
        if (results.length >= 5) break;
      }
    }
  }

  return results.slice(0, 5);
}

// ── Keyword / application search ──────────────────────────────────────────────
async function searchByKeyword(query: string): Promise<SearchResult[]> {
  const supabase = getSupabase();
  const q = query.trim();

  // Full-text search
  const { data: ftsData, error } = await supabase
    .from('productos')
    .select('marca, ref, ean, descripcion, aplicaciones')
    .textSearch('search_vector', q, { type: 'websearch', config: 'spanish' })
    .limit(5);

  if (!error && ftsData && ftsData.length > 0) {
    return ftsData.map(p => ({
      tipo: 'producto',
      ref_ntn: p.ref,
      marca: p.marca,
      ean: p.ean,
      descripcion: p.descripcion,
      aplicaciones: p.aplicaciones,
    }));
  }

  // Fallback: ilike on descripcion
  const { data: likeData } = await supabase
    .from('productos')
    .select('marca, ref, ean, descripcion, aplicaciones')
    .or(`descripcion.ilike.%${q}%,aplicaciones.ilike.%${q}%`)
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

// Heuristic: has 4+ digit sequence → reference, else keyword
function looksLikeReference(q: string): boolean {
  return /\d{4,}/.test(q) && q.length < 35;
}

// ── Route handlers ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body as { query: string };
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query required' }, { status: 400 });
    }
    const q = query.trim().slice(0, 150);
    let results = looksLikeReference(q)
      ? await searchByReference(q)
      : await searchByKeyword(q);

    // If reference search returned nothing, fallback to keyword
    if (results.length === 0) {
      results = await searchByKeyword(q);
    }

    return NextResponse.json({ query: q, total: results.length, results });
  } catch (err) {
    console.error('[search]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (!q) return NextResponse.json({ error: 'q param required' }, { status: 400 });
  return POST(
    new NextRequest(req.url, {
      method: 'POST',
      body: JSON.stringify({ query: q }),
      headers: { 'Content-Type': 'application/json' },
    })
  );
}
