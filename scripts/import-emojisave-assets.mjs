#!/usr/bin/env node

/**
 * Import platform emoji images exposed by Emoji Save's platform comparison pages.
 *
 * Images are streamed from the source site into Cloudflare R2. Nothing is
 * written to the local assets directory, so the command can be resumed safely.
 *
 * Examples:
 *   pnpm emojisave:import -- --limit=1 --dry-run
 *   pnpm emojisave:import -- --asset-mode=download-png --manifest=.cache/emojisave-png-images.json
 *   pnpm emojisave:import -- --concurrency=6
 *   R2_ACCOUNT_ID=... pnpm emojisave:import -- --resume
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';

const SOURCE_ORIGIN = process.env.EMOJISAVE_ORIGIN || 'https://emojisave.com';
const SOURCE_LOCALE = process.env.EMOJISAVE_LOCALE || 'en';
const DEFAULT_PLATFORMS = [
  'google',
  'microsoft-3D-fluent',
  'apple',
  'microsoft',
  'discord',
  'twitter',
  'toss-face',
];
const DEFAULT_BUCKET = process.env.R2_BUCKET_NAME || 'find-emoji-assets';
const DEFAULT_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'c9fb4c265411a1e5c1060b5e136be805';
const DEFAULT_PROFILE = process.env.R2_AWS_PROFILE || 'r2';
const DEFAULT_UPLOAD_METHOD = process.env.R2_UPLOAD_METHOD || 'wrangler';
const DEFAULT_CONCURRENCY = Number(process.env.EMOJISAVE_CONCURRENCY || 4);
const DEFAULT_UPLOAD_DELAY_MS = Number(process.env.R2_UPLOAD_DELAY_MS || 150);
const DEFAULT_STATE_FILE = path.join(process.cwd(), '.cache', 'emojisave-r2-state.json');
const DEFAULT_MANIFEST_FILE = path.join(process.cwd(), '.cache', 'emojisave-images.json');
const DEFAULT_PNG_MANIFEST_FILE = path.join(process.cwd(), '.cache', 'emojisave-png-images.json');

const options = parseArgs(process.argv.slice(2));
const r2Endpoint = process.env.R2_ENDPOINT_URL ||
  `https://${options.accountId}.r2.cloudflarestorage.com`;

function parseArgs(args) {
  const parsed = {
    accountId: DEFAULT_ACCOUNT_ID,
    assetMode: 'page-images',
    bucket: DEFAULT_BUCKET,
    concurrency: DEFAULT_CONCURRENCY,
    dryRun: false,
    limit: null,
    platforms: DEFAULT_PLATFORMS,
    resume: true,
    seedPlatform: 'google',
    stateFile: DEFAULT_STATE_FILE,
    upload: true,
    uploadMethod: DEFAULT_UPLOAD_METHOD,
    manifestFile: DEFAULT_MANIFEST_FILE,
    manifestFileExplicit: false,
    uploadDelayMs: DEFAULT_UPLOAD_DELAY_MS,
  };

  for (const arg of args) {
    if (arg === '--') continue;
    if (arg === '--dry-run') parsed.dryRun = true;
    else if (arg === '--download-png' || arg === '--png-only') parsed.assetMode = 'download-png';
    else if (arg === '--no-upload') parsed.upload = false;
    else if (arg === '--no-resume') parsed.resume = false;
    else if (arg === '--resume') parsed.resume = true;
    else if (arg.startsWith('--account-id=')) parsed.accountId = arg.slice(13);
    else if (arg.startsWith('--asset-mode=')) parsed.assetMode = arg.slice(13);
    else if (arg.startsWith('--bucket=')) parsed.bucket = arg.slice(9);
    else if (arg.startsWith('--concurrency=')) parsed.concurrency = positiveInt(arg.slice(14), DEFAULT_CONCURRENCY);
    else if (arg.startsWith('--limit=')) parsed.limit = positiveInt(arg.slice(8), null);
    else if (arg.startsWith('--platforms=')) parsed.platforms = arg.slice(12).split(',').map((value) => value.trim()).filter(Boolean);
    else if (arg.startsWith('--seed-platform=')) parsed.seedPlatform = arg.slice(16);
    else if (arg.startsWith('--state-file=')) parsed.stateFile = path.resolve(arg.slice(13));
    else if (arg.startsWith('--upload-method=')) parsed.uploadMethod = arg.slice(16);
    else if (arg.startsWith('--manifest=')) {
      parsed.manifestFile = path.resolve(arg.slice(11));
      parsed.manifestFileExplicit = true;
    }
    else if (arg.startsWith('--upload-delay=')) parsed.uploadDelayMs = positiveInt(arg.slice(15), DEFAULT_UPLOAD_DELAY_MS);
    else if (arg === '--help' || arg === '-h') printHelp(0);
    else fail(`Unknown argument: ${arg}`);
  }

  parsed.concurrency = Math.max(1, parsed.concurrency);
  if (!['aws', 'wrangler'].includes(parsed.uploadMethod)) {
    fail(`Unsupported upload method: ${parsed.uploadMethod}. Use aws or wrangler.`);
  }
  if (!['page-images', 'download-png'].includes(parsed.assetMode)) {
    fail(`Unsupported asset mode: ${parsed.assetMode}. Use page-images or download-png.`);
  }
  if (parsed.assetMode === 'download-png' && !parsed.manifestFileExplicit) {
    parsed.manifestFile = DEFAULT_PNG_MANIFEST_FILE;
  }
  if (!parsed.platforms.includes(parsed.seedPlatform)) {
    parsed.platforms = [parsed.seedPlatform, ...parsed.platforms];
  }
  delete parsed.manifestFileExplicit;
  return parsed;
}

function positiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function printHelp(exitCode) {
  console.log(`Usage: pnpm emojisave:import -- [options]

Options:
  --dry-run                 Crawl and list assets without uploading
  --asset-mode=MODE         Discovery mode: page-images or download-png (default: page-images)
  --download-png            Alias for --asset-mode=download-png
  --no-upload               Crawl only; do not invoke AWS CLI
  --limit=N                 Process only the first N emoji slugs
  --concurrency=N           Concurrent source/upload jobs (default: ${DEFAULT_CONCURRENCY})
  --platforms=a,b           Source platform slugs to discover
  --seed-platform=google    Detail page platform used for Compare extraction
  --account-id=ID           Cloudflare account ID
  --bucket=NAME             R2 bucket (default: ${DEFAULT_BUCKET})
  --upload-method=wrangler  Upload backend: wrangler or aws
  --upload-delay=MS         Delay before each upload attempt
  --state-file=PATH         Resume state file
  --manifest=PATH           Cached discovered image manifest
  --no-resume               Upload keys again even when state says they succeeded
`);
  process.exit(exitCode);
}

function fail(message) {
  console.error(`\nERROR: ${message}`);
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, { asText = false } = {}) {
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        redirect: 'follow',
        headers: {
          accept: asText ? 'text/html' : 'image/avif,image/webp,image/png,image/*,*/*;q=0.8',
          'user-agent': 'EmojiDirectoryAssetImporter/1.0 (+https://emojidir.com)',
        },
      });
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await sleep(500 * attempt);
      continue;
    }

    if (response.ok) return response;

    const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
    await response.body?.cancel();
    if (!retryable || attempt === maxAttempts) {
      throw new Error(`${response.status} ${response.statusText} for ${url}`);
    }
    await sleep(Math.min(10000, 750 * (2 ** (attempt - 1))));
  }

  throw new Error(`Unable to fetch ${url}`);
}

async function fetchHtml(url) {
  const response = await fetchWithRetry(url, { asText: true });
  return response.text();
}

function extractSlugs(html) {
  const slugs = new Set();
  for (const match of html.matchAll(/slug:\"([^\"]+)\"/g)) {
    slugs.add(match[1]);
  }
  return [...slugs];
}

function extractImageReferences(html) {
  const images = new Map();
  const pattern = /(?:src|content)=["'](\/emojis\/([^/]+)\/([^/]+)\/([^"']+\.(?:webp|png|svg)))["']/gi;

  for (const match of html.matchAll(pattern)) {
    const sourcePath = match[1];
    const platform = match[2];
    const size = match[3];
    const filename = match[4];
    const key = `${platform}/${size}/${filename}`;
    images.set(key, {
      filename,
      key,
      platform,
      size,
      sourcePath,
      url: new URL(sourcePath, SOURCE_ORIGIN).href,
    });
  }

  return [...images.values()];
}

function getHtmlAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'));
  return match?.[1] || '';
}

function extractDownloadPngReferences(html) {
  const images = new Map();

  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\sdownload(?:=["'][^"']*["'])?/i.test(tag)) continue;

    const sourcePath = getHtmlAttribute(tag, 'href');
    const pathMatch = sourcePath.match(/^\/emojis\/([^/]+)\/(png)\/([^/]+\.png)$/i);
    if (!pathMatch) continue;

    const platform = pathMatch[1];
    const size = pathMatch[2].toLowerCase();
    const filename = pathMatch[3];
    const key = `${platform}/${size}/${filename}`;
    images.set(key, {
      filename,
      key,
      platform,
      size,
      sourcePath,
      url: new URL(sourcePath, SOURCE_ORIGIN).href,
    });
  }

  return [...images.values()];
}

async function mapConcurrent(items, worker, concurrency) {
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, concurrency), items.length || 1);

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      await worker(items[index], index);
    }
  }));
}

async function discoverSlugs() {
  const slugPlatforms = new Map();
  console.log(`Discovering emoji slugs from ${options.platforms.length} platform indexes...`);

  await mapConcurrent(options.platforms, async (platform) => {
    const url = `${SOURCE_ORIGIN}/${SOURCE_LOCALE}/platform/${platform}`;
    try {
      const slugs = extractSlugs(await fetchHtml(url));
      for (const slug of slugs) {
        const platforms = slugPlatforms.get(slug) || [];
        if (!platforms.includes(platform)) platforms.push(platform);
        slugPlatforms.set(slug, platforms);
      }
      console.log(`  ${platform}: ${slugs.length} slugs`);
    } catch (error) {
      console.error(`  ${platform}: failed (${error.message})`);
    }
  }, Math.min(options.concurrency, options.platforms.length));

  const slugs = [...slugPlatforms.keys()].sort();
  const selectedSlugs = options.limit ? slugs.slice(0, options.limit) : slugs;
  return { slugPlatforms, slugs: selectedSlugs };
}

async function collectImages(slugs, slugPlatforms) {
  const images = new Map();
  const failures = [];
  let completed = 0;

  await mapConcurrent(slugs, async (slug) => {
    let extracted = [];

    switch (options.assetMode) {
      case 'download-png': {
        const candidatePlatforms = slugPlatforms.get(slug) || [];

        for (const platform of candidatePlatforms) {
          const url = `${SOURCE_ORIGIN}/${SOURCE_LOCALE}/platform/${platform}/${slug}`;
          try {
            const html = await fetchHtml(url);
            extracted.push(...extractDownloadPngReferences(html));
          } catch (error) {
            failures.push({ slug: `${platform}/${slug}`, error: error.message });
          }
        }
        break;
      }

      case 'page-images': {
        const candidatePlatforms = [
          options.seedPlatform,
          ...(slugPlatforms.get(slug) || []),
        ].filter((platform, index, list) => list.indexOf(platform) === index);

        for (const platform of candidatePlatforms) {
          const url = `${SOURCE_ORIGIN}/${SOURCE_LOCALE}/platform/${platform}/${slug}`;
          try {
            const html = await fetchHtml(url);
            extracted = extractImageReferences(html);
            if (extracted.length > 0) break;
          } catch (error) {
            if (platform === candidatePlatforms[candidatePlatforms.length - 1]) {
              failures.push({ slug, error: error.message });
            }
          }
        }
        break;
      }
    }

    for (const image of extracted) images.set(image.key, image);
    completed += 1;
    if (completed % 100 === 0 || completed === slugs.length) {
      console.log(`  details: ${completed}/${slugs.length}, unique images: ${images.size}`);
    }
  }, options.concurrency);

  return { failures, images: [...images.values()] };
}

function loadState() {
  if (!options.resume || !fs.existsSync(options.stateFile)) return new Set();
  try {
    const state = JSON.parse(fs.readFileSync(options.stateFile, 'utf8'));
    return new Set(Array.isArray(state.uploaded) ? state.uploaded : []);
  } catch (error) {
    console.warn(`Could not read resume state: ${error.message}`);
    return new Set();
  }
}

function saveState(uploaded) {
  fs.mkdirSync(path.dirname(options.stateFile), { recursive: true });
  fs.writeFileSync(options.stateFile, JSON.stringify({
    updatedAt: new Date().toISOString(),
    uploaded: [...uploaded].sort(),
  }, null, 2) + '\n');
}

function loadManifest() {
  if (!options.resume || !fs.existsSync(options.manifestFile)) return null;
  try {
    const manifest = JSON.parse(fs.readFileSync(options.manifestFile, 'utf8'));
    if (!Array.isArray(manifest.images) || manifest.images.length === 0) return null;
    if (options.assetMode === 'download-png' && manifest.assetMode !== 'download-png') return null;
    return manifest.images;
  } catch (error) {
    console.warn(`Could not read image manifest: ${error.message}`);
    return null;
  }
}

function saveManifest(slugs, images) {
  fs.mkdirSync(path.dirname(options.manifestFile), { recursive: true });
  fs.writeFileSync(options.manifestFile, JSON.stringify({
    generatedAt: new Date().toISOString(),
    assetMode: options.assetMode,
    locale: SOURCE_LOCALE,
    slugs,
    images,
  }, null, 2) + '\n');
}

function runAws(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('aws', [
      ...args,
      '--endpoint-url', r2Endpoint,
      '--profile', DEFAULT_PROFILE,
      '--no-cli-pager',
    ], {
      env: { ...process.env, AWS_PAGER: '' },
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    const stderr = [];
    child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.join('').trim() || `aws exited with code ${code}`));
    });
  });
}

function runWrangler(args, { capture = false, remote = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('wrangler', [
      ...args,
      ...(remote ? ['--remote'] : []),
    ], {
      env: { ...process.env, NO_COLOR: '1' },
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'ignore', 'pipe'],
    });
    const stdout = [];
    const stderr = [];
    if (capture) child.stdout.on('data', (chunk) => stdout.push(chunk.toString()));
    child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(stdout.join(''));
      else reject(new Error(stderr.join('').trim() || `wrangler exited with code ${code}`));
    });
  });
}

async function verifyR2Access() {
  console.log(`Checking R2 access: ${options.bucket} at ${r2Endpoint}`);
  if (options.uploadMethod === 'wrangler') {
    const output = await runWrangler(['r2', 'bucket', 'list'], { capture: true });
    if (!new RegExp(`name:\\s+${escapeRegExp(options.bucket)}(?:\\s|$)`, 'm').test(output)) {
      throw new Error(`Bucket ${options.bucket} was not found in Wrangler's remote bucket list`);
    }
  } else {
    await runAws(['s3api', 'head-bucket', '--bucket', options.bucket]);
  }
  console.log('R2 access verified.');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mimeType(key) {
  if (key.endsWith('.svg')) return 'image/svg+xml';
  if (key.endsWith('.png')) return 'image/png';
  return 'image/webp';
}

async function uploadImage(image) {
  const response = await fetchWithRetry(image.url);
  if (!response.body) throw new Error(`Empty response body for ${image.url}`);

  return new Promise((resolve, reject) => {
    const command = options.uploadMethod === 'wrangler' ? 'wrangler' : 'aws';
    const args = options.uploadMethod === 'wrangler'
      ? [
        'r2', 'object', 'put', `${options.bucket}/${image.key}`,
        '--pipe',
        '--content-type', mimeType(image.key),
        '--cache-control', 'public,max-age=31536000,immutable',
        '--remote',
      ]
      : [
        's3', 'cp', '-', `s3://${options.bucket}/${image.key}`,
        '--content-type', mimeType(image.key),
        '--cache-control', 'public,max-age=31536000,immutable',
        '--only-show-errors',
        '--endpoint-url', r2Endpoint,
        '--profile', DEFAULT_PROFILE,
        '--no-cli-pager',
      ];
    const child = spawn(command, args, {
      env: { ...process.env, AWS_PAGER: '' },
      stdio: ['pipe', 'ignore', 'pipe'],
    });
    const stderr = [];
    let settled = false;

    const rejectOnce = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));
    child.on('error', rejectOnce);
    child.on('close', (code) => {
      if (settled) return;
      if (code === 0) {
        settled = true;
        resolve();
      } else {
        rejectOnce(new Error(stderr.join('').trim() || `${command} exited with code ${code}`));
      }
    });

    const stream = Readable.fromWeb(response.body);
    stream.on('error', rejectOnce);
    child.stdin.on('error', rejectOnce);
    stream.pipe(child.stdin);
  });
}

async function uploadImageWithRetry(image) {
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await uploadImage(image);
      return;
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const isRateLimited = error.message.includes('429');
      const delay = isRateLimited
        ? Math.min(60000, 10000 * attempt)
        : Math.min(15000, 1000 * (2 ** (attempt - 1)));
      await sleep(delay);
    }
  }
}

async function uploadImages(images) {
  const uploaded = loadState();
  const pending = images.filter((image) => !uploaded.has(image.key));
  console.log(`Uploading ${pending.length} images (${uploaded.size} already recorded as uploaded)...`);

  let completed = 0;
  let failed = 0;
  const failures = [];

  await mapConcurrent(pending, async (image) => {
    try {
      await sleep(options.uploadDelayMs);
      await uploadImageWithRetry(image);
      uploaded.add(image.key);
      if (uploaded.size % 25 === 0) saveState(uploaded);
    } catch (error) {
      failed += 1;
      failures.push({ key: image.key, error: error.message });
      if (failures.length <= 10) console.error(`  upload failed: ${image.key}: ${error.message}`);
    }
    completed += 1;
    if (completed % 100 === 0 || completed === pending.length) {
      console.log(`  uploads: ${completed}/${pending.length}, failed: ${failed}`);
    }
  }, options.concurrency);

  saveState(uploaded);
  return { failed, failures, uploaded: uploaded.size };
}

async function main() {
  if (!options.upload || options.dryRun) {
    console.log(options.dryRun ? 'DRY RUN: upload disabled.' : 'Upload disabled.');
  } else {
    try {
      await verifyR2Access();
    } catch (error) {
      fail(`R2 access check failed. Provide a valid R2 S3 API token/profile. ${error.message}`);
    }
  }

  let slugs;
  let images = loadManifest();
  let detailFailures = [];

  if (images) {
    slugs = [];
    console.log(`Loaded ${images.length} images from cached manifest.`);
  } else {
    const discovered = await discoverSlugs();
    slugs = discovered.slugs;
    if (slugs.length === 0) fail('No emoji slugs were discovered.');
    const detailResults = await collectImages(slugs, discovered.slugPlatforms);
    images = detailResults.images;
    detailFailures = detailResults.failures;
    saveManifest(slugs, images);
  }

  console.log(`\nDiscovered ${slugs.length} slugs and ${images.length} unique image keys.`);
  if (images.length > 0) {
    console.log(`Example: ${images.slice(0, 5).map((image) => image.key).join(', ')}`);
  }
  if (detailFailures.length > 0) {
    console.warn(`Detail pages failed: ${detailFailures.length}`);
    detailFailures.slice(0, 10).forEach((failure) => console.warn(`  ${failure.slug}: ${failure.error}`));
  }

  if (options.dryRun || !options.upload) return;

  const result = await uploadImages(images);
  console.log(`\nDone. Uploaded/recorded: ${result.uploaded}; failed: ${result.failed}.`);
  result.failures.slice(0, 20).forEach((failure) => console.error(`  ${failure.key}: ${failure.error}`));
  if (result.failed > 0) process.exitCode = 1;
}

main().catch((error) => fail(error.stack || error.message));
