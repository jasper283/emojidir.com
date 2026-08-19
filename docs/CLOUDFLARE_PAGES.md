# Cloudflare Pages deployment

This project is configured as a static Next.js export. Cloudflare Pages serves the generated `out/` directory, while emoji images remain on the existing Cloudflare R2 custom domain.

## Pages settings

Connect the repository to Cloudflare Pages with these values:

- Framework preset: Next.js (Static HTML Export)
- Build command: `npm run build`
- Build output directory: `out`
- Node.js version: `20`

The build creates every locale, platform landing page, blog page, and SEO emoji detail page. Search, category filtering, pagination, and blog tag filtering run in the browser, so they do not invoke a server or ISR function.

## R2 settings

Keep `NEXT_PUBLIC_R2_PUBLIC_CDN_URL` pointed at the public R2 custom domain used by `config/cdn.ts` (`https://object.emojidir.com` in this repository). If the variable is omitted, the repository default is used.

For the fastest download behavior, configure the bucket CORS policy to allow `GET` and `HEAD` from:

- `https://emojidir.com`
- `https://www.emojidir.com`
- local development origins when needed

The UI falls back to opening the R2 asset directly when CORS is unavailable, so image browsing still works without this setting.

## Custom domain

Add `emojidir.com` and `www.emojidir.com` under the Pages project custom domains. Keep `object.emojidir.com` as the separate R2 asset domain.

## Local verification

```bash
npm run build
npx serve out
```

Check the locale home page, a platform page, an emoji detail page, a search query, a pagination query, a blog tag query, and an image download before changing DNS.
