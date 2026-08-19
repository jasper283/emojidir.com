const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const publicDataDir = path.join(projectRoot, 'public', 'data');

fs.mkdirSync(publicDataDir, { recursive: true });

for (const filename of ['emoji-seo.json', 'emojipedia-content.json', 'emojisave-assets.json']) {
  fs.copyFileSync(
    path.join(projectRoot, 'data', filename),
    path.join(publicDataDir, filename)
  );
}

console.log('Prepared static detail data for Cloudflare Pages.');
