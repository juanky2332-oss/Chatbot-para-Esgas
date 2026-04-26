const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const BASE = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'src', 'data');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// === EQUIVALENCIAS ===
const eq = XLSX.readFile(path.join(BASE, 'Equivalencias entre productos.xlsx'));
const eqRaw = XLSX.utils.sheet_to_json(eq.Sheets[eq.SheetNames[0]], { defval: '' });

const equivalencias = [];
for (let i = 1; i < eqRaw.length; i++) {
  const r = eqRaw[i];
  const skf = String(r['PRODUCTOS DE OTRAS MARCAS'] || '').trim();
  const fag = String(r['__EMPTY'] || '').trim();
  const nsk = String(r['__EMPTY_1'] || '').trim();
  const ref = String(r['PRODUCTOS EQUIVALENTES  DE NUESTRA MARCA'] || '').trim();
  const marca = String(r['__EMPTY_2'] || '').trim();
  const ean = String(r['__EMPTY_3'] || '').trim();
  if (ref && (skf || fag || nsk)) {
    equivalencias.push([skf, fag, nsk, ref, marca, ean]);
  }
}

// === APLICACIONES — only desc field (most useful per-product info) ===
// Skip rows where desc is empty. The gama/argumento/fortalezas are too long and repeated.
const ap = XLSX.readFile(path.join(BASE, 'Tipos de aplicaciones.xlsx'));
const apRaw = XLSX.utils.sheet_to_json(ap.Sheets[ap.SheetNames[0]], { defval: '' });

const aplicaciones = [];
let withApps = 0;
for (let i = 1; i < apRaw.length; i++) {
  const r = apRaw[i];
  const marca = String(r['INFORMACIÓN'] || '').trim();
  const ref = String(r['__EMPTY'] || '').trim();
  const desc = String(r['INFORMACIÓN DE PRODUCTO'] || '').trim();
  const apps = String(r['__EMPTY_4'] || '').trim();
  const appsClean = (apps === '-' || !apps) ? '' : apps;
  if (appsClean) withApps++;
  if (ref && desc) {
    aplicaciones.push([marca, ref, desc, appsClean]);
  }
}

console.log(`Aplicaciones with useful apps field: ${withApps}/${aplicaciones.length}`);

const eqJson = JSON.stringify({ cols: ['skf','fag','nsk','ref','marca','ean'], rows: equivalencias });
const apJson = JSON.stringify({ cols: ['marca','ref','desc','apps'], rows: aplicaciones });

fs.writeFileSync(path.join(OUT, 'equivalencias.json'), eqJson, 'utf8');
fs.writeFileSync(path.join(OUT, 'aplicaciones.json'), apJson, 'utf8');

console.log(`equivalencias.json: ${equivalencias.length} rows, ${(eqJson.length / 1024).toFixed(1)} KB`);
console.log(`aplicaciones.json: ${aplicaciones.length} rows, ${(apJson.length / 1024).toFixed(1)} KB`);
console.log('Done.');
