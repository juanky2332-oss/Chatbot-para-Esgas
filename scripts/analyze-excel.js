const XLSX = require('xlsx');
const path = require('path');

const BASE = path.join(__dirname, '..', '..');
const ap = XLSX.readFile(path.join(BASE, 'Tipos de aplicaciones.xlsx'));
const apRaw = XLSX.utils.sheet_to_json(ap.Sheets[ap.SheetNames[0]], { defval: '' });

// Check field sizes and uniqueness
const fieldLengths = { marca:0, ref:0, ean:0, desc:0, gama:0, argumento:0, apps:0, fortalezas:0 };
const uniqueGama = new Set();
const uniqueArgumento = new Set();
const uniqueApps = new Set();
let appsNotDash = 0;

for (let i = 1; i < Math.min(apRaw.length, 200); i++) {
  const r = apRaw[i];
  fieldLengths.marca += String(r['INFORMACIÓN']||'').length;
  fieldLengths.ref += String(r['__EMPTY']||'').length;
  fieldLengths.ean += String(r['__EMPTY_1']||'').length;
  fieldLengths.desc += String(r['INFORMACIÓN DE PRODUCTO']||'').length;
  fieldLengths.gama += String(r['__EMPTY_2']||'').length;
  fieldLengths.argumento += String(r['__EMPTY_3']||'').length;
  fieldLengths.apps += String(r['__EMPTY_4']||'').length;
  fieldLengths.fortalezas += String(r['__EMPTY_5']||'').length;
  uniqueGama.add(String(r['__EMPTY_2']||'').trim());
  uniqueArgumento.add(String(r['__EMPTY_3']||'').trim());
  uniqueApps.add(String(r['__EMPTY_4']||'').trim());
  if (String(r['__EMPTY_4']||'').trim() && String(r['__EMPTY_4']||'').trim() !== '-') appsNotDash++;
}

console.log('Avg field lengths (first 199 rows):');
for (const [k,v] of Object.entries(fieldLengths)) {
  console.log(`  ${k}: ${(v/199).toFixed(1)} chars avg`);
}
console.log(`\nUnique 'gama' texts (out of 199): ${uniqueGama.size}`);
console.log(`Unique 'argumento' texts: ${uniqueArgumento.size}`);
console.log(`Unique 'apps' texts: ${uniqueApps.size}`);
console.log(`Apps not dash/empty: ${appsNotDash}/199`);

// Show some apps samples
let count = 0;
for (let i = 1; i < apRaw.length && count < 10; i++) {
  const apps = String(apRaw[i]['__EMPTY_4']||'').trim();
  if (apps && apps !== '-') {
    console.log(`\nApps example (ref=${String(apRaw[i]['__EMPTY']||'')}): ${apps.substring(0,200)}`);
    count++;
  }
}
