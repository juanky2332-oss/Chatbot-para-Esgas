const XLSX = require('xlsx');
const mammoth = require('mammoth');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..', '..');
const SUPABASE_URL = 'https://cjfuhuaxeaxgfnrgzhys.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqZnVodWF4ZWF4Z2Zucmd6aHlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE2Mjk5OCwiZXhwIjoyMDkyNzM4OTk4fQ.ByyccBJgL3FzV-hfgbNQaRJpPaRKxHHfQe5dZW1iM1Y';

// ── HTTP helper ───────────────────────────────��───────────────────────────────��
function supabasePost(table, rows) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows);
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.statusCode);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function uploadBatches(table, rows, batchSize = 500) {
  let uploaded = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await supabasePost(table, batch);
    uploaded += batch.length;
    process.stdout.write(`\r  ${table}: ${uploaded}/${rows.length} subidos...`);
  }
  console.log(`\r  ✓ ${table}: ${uploaded} registros cargados.`);
}

// ── Delete existing data ──────────────────────────────────────────────��─────────
function supabaseDelete(table) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}?id=gte.0`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject);
    req.end();
  });
}

// ── Parse EQUIVALENCIAS ────────────────────────────────────────────────────────
function parseEquivalencias() {
  const wb = XLSX.readFile(path.join(BASE, 'Equivalencias entre productos.xlsx'));
  const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  const rows = [];
  for (let i = 1; i < raw.length; i++) {
    const r = raw[i];
    const skf = String(r['PRODUCTOS DE OTRAS MARCAS'] || '').trim();
    const fag = String(r['__EMPTY'] || '').trim();
    const nsk = String(r['__EMPTY_1'] || '').trim();
    const ref_ntn = String(r['PRODUCTOS EQUIVALENTES  DE NUESTRA MARCA'] || '').trim();
    const marca = String(r['__EMPTY_2'] || '').trim();
    const ean = String(r['__EMPTY_3'] || '').trim();
    if (ref_ntn && (skf || fag || nsk)) {
      rows.push({
        skf: skf || null,
        fag: fag || null,
        nsk: nsk || null,
        ref_ntn,
        marca: marca || null,
        ean: ean || null,
      });
    }
  }
  return rows;
}

// ── Parse PRODUCTOS (Tipos de aplicaciones) ────────────────────────────────────
function parseProductos() {
  const wb = XLSX.readFile(path.join(BASE, 'Tipos de aplicaciones.xlsx'));
  const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  const rows = [];
  for (let i = 1; i < raw.length; i++) {
    const r = raw[i];
    const marca = String(r['INFORMACIÓN'] || '').trim();
    const ref = String(r['__EMPTY'] || '').trim();
    const ean = String(r['__EMPTY_1'] || '').trim();
    const descripcion = String(r['INFORMACIÓN DE PRODUCTO'] || '').trim();
    const apps_raw = String(r['__EMPTY_4'] || '').trim();
    const aplicaciones = (apps_raw === '-' || !apps_raw) ? null : apps_raw;
    if (ref) {
      rows.push({
        marca: marca || null,
        ref,
        ean: ean || null,
        descripcion: descripcion || null,
        aplicaciones,
      });
    }
  }
  return rows;
}

// ── Parse TIPOS DE PREGUNTA (Word doc) ────────────────────────────────────────
async function parseTiposPregunta() {
  const result = await mammoth.extractRawText({
    path: path.join(BASE, 'Tipos de pregunta por documento.docx'),
  });
  const text = result.value;

  // Split into sections by line and extract meaningful blocks
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const rows = [];
  let current = null;

  for (const line of lines) {
    // Detect section headers (lines in ALL CAPS or starting with digits like "1.", "2.")
    const isHeader = /^[A-ZÁÉÍÓÚ\s\-:]{10,}$/.test(line) || /^\d+[.)]\s+/.test(line) || line.endsWith(':');

    if (isHeader && line.length > 5) {
      if (current) rows.push(current);
      current = { tipo: line.replace(/^\d+[.)]\s*/, '').replace(/:$/, '').trim(), descripcion: '', ejemplos: '', fuente: 'Tipos de pregunta por documento.docx' };
    } else if (current) {
      if (line.toLowerCase().includes('ejemplo') || line.startsWith('-') || line.startsWith('•')) {
        current.ejemplos += (current.ejemplos ? '\n' : '') + line;
      } else {
        current.descripcion += (current.descripcion ? '\n' : '') + line;
      }
    }
  }
  if (current) rows.push(current);

  // If parsing didn't produce meaningful sections, store as chunks
  if (rows.length < 3) {
    const chunkSize = 800;
    rows.length = 0;
    for (let i = 0; i < lines.length; i += 15) {
      const chunk = lines.slice(i, i + 15).join('\n');
      rows.push({
        tipo: `Sección ${Math.floor(i/15) + 1}`,
        descripcion: chunk,
        ejemplos: null,
        fuente: 'Tipos de pregunta por documento.docx',
      });
    }
  }

  return rows;
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== CARGA DE DATOS A SUPABASE ESGAS ===\n');

  // 1. Equivalencias
  console.log('1. Parseando Equivalencias entre productos.xlsx...');
  const equivalencias = parseEquivalencias();
  console.log(`   ${equivalencias.length} registros encontrados.`);
  console.log('   Borrando datos anteriores...');
  await supabaseDelete('equivalencias');
  console.log('   Subiendo...');
  await uploadBatches('equivalencias', equivalencias, 500);

  // 2. Productos
  console.log('\n2. Parseando Tipos de aplicaciones.xlsx...');
  const productos = parseProductos();
  console.log(`   ${productos.length} registros encontrados.`);
  console.log('   Borrando datos anteriores...');
  await supabaseDelete('productos');
  console.log('   Subiendo...');
  await uploadBatches('productos', productos, 500);

  // 3. Tipos de pregunta
  console.log('\n3. Parseando Tipos de pregunta por documento.docx...');
  const tiposPregunta = await parseTiposPregunta();
  console.log(`   ${tiposPregunta.length} secciones encontradas.`);
  await supabaseDelete('tipos_pregunta');
  await uploadBatches('tipos_pregunta', tiposPregunta, 100);

  console.log('\n✓ CARGA COMPLETA. Verificando...');

  // Quick count check
  const fetch_count = (table) => new Promise((resolve) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'count=exact',
      },
    };
    https.get(options, res => {
      const range = res.headers['content-range'] || '?';
      resolve(range);
    }).on('error', () => resolve('error'));
  });

  for (const t of ['equivalencias','productos','tipos_pregunta']) {
    const range = await fetch_count(t);
    console.log(`  ${t}: ${range}`);
  }
}

main().catch(err => { console.error('\nERROR:', err.message); process.exit(1); });
