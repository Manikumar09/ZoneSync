/** Copy the maintained source into the folder used for deployment. */
const { cpSync, mkdirSync, rmSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(path.join(root, 'src'), output, { recursive: true });
writeFileSync(path.join(output, '.nojekyll'), '');
console.log('Built MunuteAtlas in dist/.');
