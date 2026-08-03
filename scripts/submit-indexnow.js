const fs = require('fs');
const path = require('path');

const SITE_URL = (process.env.INDEXNOW_SITE_URL || 'https://emojidir.com').replace(/\/$/, '');
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const KEY_FILE = '5ec00dbebac007a3cbbcb857f048e3cb.txt';
const KEY_PATH = path.join(__dirname, '..', 'public', KEY_FILE);
const MAX_URLS_PER_REQUEST = 10_000;

function readKey() {
  const key = fs.readFileSync(KEY_PATH, 'utf8').trim();

  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
    throw new Error(`Invalid IndexNow key in ${KEY_PATH}`);
  }

  return key;
}

function parseSitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi), ([, url]) => url.trim());
}

function normalizeUrls(urls) {
  const site = new URL(SITE_URL);
  const uniqueUrls = new Set();

  for (const value of urls) {
    const url = new URL(value, site);

    if (url.hostname !== site.hostname) {
      throw new Error(`Refusing to submit URL from another host: ${url.href}`);
    }

    url.hash = '';
    uniqueUrls.add(url.href);
  }

  return Array.from(uniqueUrls);
}

async function getUrlsFromSitemap() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const response = await fetch(sitemapUrl, {
    headers: { 'User-Agent': 'emojidir-indexnow/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch ${sitemapUrl}: ${response.status} ${response.statusText}`);
  }

  const urls = parseSitemapUrls(await response.text());

  if (urls.length === 0) {
    throw new Error(`No URLs found in ${sitemapUrl}`);
  }

  return urls;
}

function chunk(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function submit(urlList, key) {
  const site = new URL(SITE_URL);
  const batches = chunk(urlList, MAX_URLS_PER_REQUEST);

  for (const [index, batch] of batches.entries()) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: site.hostname,
        key,
        keyLocation: `${SITE_URL}/${KEY_FILE}`,
        urlList: batch,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `IndexNow batch ${index + 1}/${batches.length} failed: ` +
          `${response.status} ${response.statusText}${details ? ` - ${details}` : ''}`
      );
    }

    console.log(
      `Submitted batch ${index + 1}/${batches.length}: ${batch.length} URLs ` +
        `(${response.status} ${response.statusText})`
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const requestedUrls = args.filter((arg) => arg !== '--dry-run');
  const key = readKey();
  const urls = normalizeUrls(
    requestedUrls.length > 0 ? requestedUrls : await getUrlsFromSitemap()
  );

  console.log(`IndexNow key location: ${SITE_URL}/${KEY_FILE}`);
  console.log(`URLs ready for submission: ${urls.length}`);

  if (dryRun) {
    console.log('Dry run complete; no URLs were submitted.');
    return;
  }

  await submit(urls, key);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
