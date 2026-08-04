import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const EMOJI_INDEX_PATH = path.join(ROOT, 'data', 'emoji-index.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'emoji-seo.json');
const EMOJI_TEST_URL = 'https://www.unicode.org/Public/emoji/latest/emoji-test.txt';
const CLDR_PACKAGE_URL =
  'https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-annotations-full/package.json';
const CLDR_ANNOTATIONS_URL = (locale) =>
  `https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-annotations-full/annotations/${locale}/annotations.json`;

const CLDR_LOCALES = {
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  'zh-CN': 'zh',
  'zh-TW': 'zh-Hant',
  'pt-BR': 'pt',
};

const UNICODE_VERSION_BY_EMOJI_VERSION = {
  'E0.6': 'Unicode 6.0',
  'E0.7': 'Unicode 7.0',
  'E1.0': 'Unicode 8.0',
  'E2.0': 'Unicode 8.0',
  'E3.0': 'Unicode 9.0',
  'E4.0': 'Unicode 9.0',
  'E5.0': 'Unicode 10.0',
  'E11.0': 'Unicode 11.0',
  'E12.0': 'Unicode 12.0',
  'E12.1': 'Unicode 12.1',
  'E13.0': 'Unicode 13.0',
  'E13.1': 'Unicode 13.0',
  'E14.0': 'Unicode 14.0',
  'E15.0': 'Unicode 15.0',
  'E15.1': 'Unicode 15.0',
  'E16.0': 'Unicode 16.0',
  'E17.0': 'Unicode 17.0',
};

const SKIN_TONE_CODE_POINTS = new Set([
  '1F3FB',
  '1F3FC',
  '1F3FD',
  '1F3FE',
  '1F3FF',
]);

function codePointsFromString(value) {
  return [...value]
    .map((character) => character.codePointAt(0).toString(16).toUpperCase())
    .join(' ');
}

function codePointsKey(value) {
  return codePointsFromString(value)
    .split(' ')
    .filter((codePoint) => codePoint !== 'FE0F')
    .join(' ');
}

function unicodeKey(value) {
  return value
    .replace(/U\+/gi, '')
    .trim()
    .split(/\s+/)
    .map((codePoint) => Number.parseInt(codePoint, 16).toString(16).toUpperCase())
    .filter(Boolean)
    .filter((codePoint) => codePoint !== 'FE0F')
    .join(' ');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function parseEmojiTest(source) {
  const rows = [];
  let emojiVersion = null;

  for (const line of source.split('\n')) {
    const versionMatch = line.match(/^# Version: (.+)$/);
    if (versionMatch) {
      emojiVersion = versionMatch[1].trim();
    }

    const match = line.match(
      /^([0-9A-F ]+)\s+;\s+(fully-qualified|minimally-qualified|unqualified|component)\s+#\s+(\S+)\s+(E\d+(?:\.\d+)?)\s+(.+)$/
    );
    if (!match) continue;

    const [, codePoints, status, glyph, version, name] = match;
    rows.push({
      codePoints: codePoints.trim(),
      sequenceKey: codePoints
        .trim()
        .split(/\s+/)
        .map((codePoint) => Number.parseInt(codePoint, 16).toString(16).toUpperCase())
        .filter((codePoint) => codePoint !== 'FE0F')
        .join(' '),
      variantKey: codePoints
        .trim()
        .split(/\s+/)
        .map((codePoint) => Number.parseInt(codePoint, 16).toString(16).toUpperCase())
        .filter((codePoint) => codePoint !== 'FE0F' && !SKIN_TONE_CODE_POINTS.has(codePoint))
        .join(' '),
      status,
      glyph,
      emojiVersion: version,
      name,
    });
  }

  return { emojiVersion, rows };
}

function parseAnnotations(source) {
  const annotations = JSON.parse(source).annotations.annotations;
  const result = new Map();

  for (const [glyph, annotation] of Object.entries(annotations)) {
    if (glyph === 'identity' || !annotation.default) continue;
    result.set(codePointsKey(glyph), annotation.default);
  }

  return result;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function main() {
  const [emojiTestSource, cldrPackageSource] = await Promise.all([
    fetchText(EMOJI_TEST_URL),
    fetchText(CLDR_PACKAGE_URL),
  ]);
  const { emojiVersion, rows } = parseEmojiTest(emojiTestSource);
  const cldrPackage = JSON.parse(cldrPackageSource);
  const annotationEntries = await Promise.all(
    Object.entries(CLDR_LOCALES).map(async ([locale, cldrLocale]) => [
      locale,
      parseAnnotations(await fetchText(CLDR_ANNOTATIONS_URL(cldrLocale))),
    ])
  );
  const annotationsByLocale = new Map(annotationEntries);
  const emojiIndex = JSON.parse(await fs.readFile(EMOJI_INDEX_PATH, 'utf8'));
  const rowsBySequence = new Map();
  const rowsByVariant = new Map();

  for (const row of rows) {
    const existingRow = rowsBySequence.get(row.sequenceKey);
    if (!existingRow || (row.status === 'fully-qualified' && existingRow.status !== 'fully-qualified')) {
      rowsBySequence.set(row.sequenceKey, row);
    }

    if (row.status !== 'fully-qualified') continue;
    const variants = rowsByVariant.get(row.variantKey) ?? [];
    variants.push(row);
    rowsByVariant.set(row.variantKey, variants);
  }

  const emojis = {};
  let unmatched = 0;

  for (const emoji of emojiIndex.e) {
    const sequenceKey = unicodeKey(emoji.u);
    const sourceRow = rowsBySequence.get(sequenceKey);
    const variantRows = rowsByVariant.get(sourceRow?.variantKey ?? sequenceKey) ?? [];
    const variants = unique(
      [sourceRow, ...variantRows].map((row) => row?.codePoints)
    ).map((codePoints) => {
      const row = rows.find((candidate) => candidate.codePoints === codePoints);
      return {
        glyph: row?.glyph ?? emoji.gl,
        unicode: codePoints,
        kind: codePoints.split(' ').some((codePoint) => SKIN_TONE_CODE_POINTS.has(codePoint))
          ? 'skin-tone'
          : 'base',
        status: row?.status ?? 'current-index',
      };
    });

    if (!sourceRow) unmatched += 1;

    const keywords = {};
    for (const locale of Object.keys(CLDR_LOCALES)) {
      const cldrKeywords = annotationsByLocale.get(locale)?.get(sequenceKey) ?? [];
      const existingKeywords = locale === 'en'
        ? emoji.k
        : emoji.i18n?.[locale]?.k ?? [];
      keywords[locale] = unique([...cldrKeywords, ...existingKeywords]);
    }

    const releaseVersion = sourceRow?.emojiVersion ?? null;
    emojis[emoji.i] = {
      emojiVersion: releaseVersion,
      releaseVersion: releaseVersion ? `Emoji ${releaseVersion.slice(1)}` : null,
      unicodeVersion: releaseVersion
        ? UNICODE_VERSION_BY_EMOJI_VERSION[releaseVersion] ?? null
        : null,
      keywords,
      copyVariants: variants.length > 0
        ? variants
        : [{ glyph: emoji.gl, unicode: emoji.u.toUpperCase(), kind: 'base', status: 'current-index' }],
    };
  }

  const output = {
    source: {
      unicodeEmojiVersion: emojiVersion,
      unicodeEmojiTest: EMOJI_TEST_URL,
      cldrVersion: cldrPackage.cldrVersion,
      cldrPackage: 'cldr-annotations-full',
      generatedAt: new Date().toISOString(),
      unmatchedEmojiCount: unmatched,
    },
    emojis,
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Generated ${Object.keys(emojis).length} Emoji SEO records at ${OUTPUT_PATH}`);
  console.log(`Unicode ${emojiVersion}; CLDR ${cldrPackage.cldrVersion}; unmatched ${unmatched}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
