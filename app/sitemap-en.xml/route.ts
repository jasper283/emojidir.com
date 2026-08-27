import { buildSitemapEntries } from '@/lib/sitemap-entries';

export const dynamic = 'force-static';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const entries = buildSitemapEntries(['en']);
  const urls = entries.map((entry) => {
    const lastModified = entry.lastModified instanceof Date
      ? entry.lastModified.toISOString()
      : entry.lastModified;

    return [
      '  <url>',
      `    <loc>${escapeXml(entry.url)}</loc>`,
      lastModified ? `    <lastmod>${escapeXml(lastModified)}</lastmod>` : '',
      entry.changeFrequency ? `    <changefreq>${entry.changeFrequency}</changefreq>` : '',
      typeof entry.priority === 'number' ? `    <priority>${entry.priority.toFixed(1)}</priority>` : '',
      '  </url>',
    ].filter(Boolean).join('\n');
  });

  return new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n'),
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    }
  );
}
