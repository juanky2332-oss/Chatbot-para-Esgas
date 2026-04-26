import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// ── Types ──────────────────────────────────────────────────────────────────────
type EqRow = [string, string, string, string, string, string]; // skf,fag,nsk,ref,marca,ean
type ApRow = [string, string, string, string]; // marca,ref,desc,apps

interface EqData { cols: string[]; rows: EqRow[] }
interface ApData { cols: string[]; rows: ApRow[] }

// ── Module-level cache (persists across warm invocations) ─────────────────────
let eqRows: EqRow[] | null = null;
let apRows: ApRow[] | null = null;

function loadData() {
  if (!eqRows || !apRows) {
    const base = path.join(process.cwd(), 'public', 'data');
    const eq: EqData = JSON.parse(fs.readFileSync(path.join(base, 'equivalencias.json'), 'utf8'));
    const ap: ApData = JSON.parse(fs.readFileSync(path.join(base, 'aplicaciones.json'), 'utf8'));
    eqRows = eq.rows;
    apRows = ap.rows;
  }
}

// ── Normalise for fuzzy matching ───────────────────────────────────────────────
function norm(s: string | number): string {
  return String(s).toUpperCase().replace(/[\s\-./]/g, '');
}

// ── Search equivalencias: input is a SKF / FAG / NSK reference ────────────────
function searchEquivalencia(query: string, limit = 5) {
  const q = norm(query);
  if (!q || !eqRows) return [];

  const exact: EqRow[] = [];
  const startsWith: EqRow[] = [];
  const contains: EqRow[] = [];

  for (const row of eqRows) {
    const [skf, fag, nsk] = row;
    const skfN = norm(skf), fagN = norm(fag), nskN = norm(nsk);
    const sources = [skfN, fagN, nskN].filter(Boolean);
    if (sources.some(s => s === q)) { exact.push(row); continue; }
    if (sources.some(s => s.startsWith(q) || q.startsWith(s))) { startsWith.push(row); continue; }
    if (sources.some(s => s.includes(q) || q.includes(s))) { contains.push(row); }
  }

  const merged = [...exact, ...startsWith, ...contains].slice(0, limit);
  return merged.map(([skf, fag, nsk, ref, marca, ean]) => ({
    tipo: 'equivalencia',
    skf: skf || null,
    fag: fag || null,
    nsk: nsk || null,
    ref_ntn: ref,
    marca,
    ean,
  }));
}

// ── Search aplicaciones: input is a NTN/SNR reference or keyword ───────────────
function searchAplicacion(query: string, limit = 5) {
  const q = norm(query);
  const qLower = query.toLowerCase();
  if (!q || !apRows) return [];

  const exactRef: ApRow[] = [];
  const partialRef: ApRow[] = [];
  const keywordMatch: ApRow[] = [];

  for (const row of apRows) {
    const [, ref, desc, apps] = row;
    const refN = norm(ref);
    if (refN === q) { exactRef.push(row); continue; }
    if (refN.startsWith(q) || q.startsWith(refN)) { partialRef.push(row); continue; }
    // keyword search in desc and apps
    const text = (desc + ' ' + apps).toLowerCase();
    if (text.includes(qLower)) { keywordMatch.push(row); }
  }

  const merged = [...exactRef, ...partialRef, ...keywordMatch].slice(0, limit);
  return merged.map(([marca, ref, desc, apps]) => ({
    tipo: 'producto',
    marca,
    ref,
    descripcion: desc,
    aplicaciones: apps || null,
  }));
}

// ── Auto search: try both ─────────────────────────────────────────────────────
function searchAuto(query: string, limit = 5) {
  const eqResults = searchEquivalencia(query, limit);
  const apResults = searchAplicacion(query, limit);

  // If we found equivalences, also enrich with application data
  const enriched = eqResults.map(eq => {
    const apMatch = apRows?.find(([, ref]) => norm(ref) === norm(eq.ref_ntn));
    return {
      ...eq,
      descripcion: apMatch ? apMatch[2] : null,
      aplicaciones: apMatch ? apMatch[3] || null : null,
    };
  });

  // Combine: equivalences first, then pure product lookups if no equivalences found
  const combined = enriched.length > 0 ? enriched : apResults;
  return combined.length > 0 ? combined : apResults.slice(0, limit);
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    loadData();
    const body = await req.json();
    const { query, type = 'auto' } = body as { query: string; type?: string };

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query required' }, { status: 400 });
    }

    const q = query.trim().slice(0, 200);
    let results;
    if (type === 'equivalencia') results = searchEquivalencia(q);
    else if (type === 'aplicacion') results = searchAplicacion(q);
    else results = searchAuto(q);

    return NextResponse.json({ query: q, total: results.length, results });
  } catch (err) {
    console.error('[search/route]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (!q) return NextResponse.json({ error: 'q param required' }, { status: 400 });
  try {
    loadData();
    const results = searchAuto(q.trim().slice(0, 200));
    return NextResponse.json({ query: q, total: results.length, results });
  } catch (err) {
    console.error('[search/route GET]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
