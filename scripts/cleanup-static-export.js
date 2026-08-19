const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'out');

function removeRscSidecars(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      removeRscSidecars(entryPath);
      continue;
    }

    // Cloudflare Pages serves the exported HTML directly. These RSC payloads
    // are only needed for Next's server-driven client navigation.
    if (entry.name.endsWith('.txt') && entry.name !== 'robots.txt') {
      fs.unlinkSync(entryPath);
    }
  }
}

removeRscSidecars(outputDir);
console.log('Removed Next.js RSC sidecars from the static export.');
