/** Check JavaScript syntax and local page references without extra packages. */
const assert = require('node:assert/strict');
const { readFileSync, readdirSync, existsSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = path.resolve(__dirname, '../src');
function checkScripts(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) checkScripts(file);
    else if (file.endsWith('.js')) new vm.Script(readFileSync(file, 'utf8'), { filename: file });
  }
}
checkScripts(source);
const html = readFileSync(path.join(source, 'index.html'), 'utf8');
// Classic scripts share a scope. Check the combined source as well, so moving a
// declaration into another file cannot silently introduce a duplicate binding.
const localScripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>/g)]
  .map(match => match[1])
  .filter(reference => !reference.startsWith('https:'));
new vm.Script(localScripts.map(file => readFileSync(path.join(source, file), 'utf8')).join('\n'));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique.');
for (const [, reference] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  if (/^(https?:|#|mailto:)/.test(reference)) continue;
  assert.ok(!reference.startsWith('/'), `Use relative paths for GitHub Pages: ${reference}`);
  assert.ok(existsSync(path.join(source, reference)), `Missing asset: ${reference}`);
}
console.log('JavaScript syntax, HTML IDs, and local asset paths passed.');
