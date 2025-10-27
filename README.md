# EmojiDir - Universal Emoji Browser

📖 [简体中文](README.zh-CN.md)

---

A modern emoji browsing and search directory supporting multiple platforms and styles.

## Features

- 🎨 Multiple display styles (3D, Color, Flat, High Contrast)
- 🏢 Multiple platforms (Fluent Emoji, Nato Emoji, iOS/Apple)
- 📂 Browse by categories
- 🔍 Keyword search
- 🎛️ Filter sidebar
- 📱 Responsive design
- 🌍 Multi-language support (English, Japanese, Korean, Chinese)
- ⚡ Fast loading
- 📊 Google Analytics integration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **i18n**: next-intl
- **Deployment**: Vercel

## Getting Started

### Install dependencies

```bash
npm install
```

### Generate emoji index

```bash
npm run generate-index
```

This scans all emojis in the `assets` directory and generates index files to `data/emoji-index.json`.

### Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the site.

## Build & Deploy

### Build the project

```bash
npm run build
```

### Deploy to Vercel

The easiest way to deploy this project:

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will detect Next.js and configure automatically

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Configuration

### Google Analytics

Create `.env.local` and add:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

See [docs/GOOGLE_ANALYTICS_SETUP.md](./docs/GOOGLE_ANALYTICS_SETUP.md) for details.

### Environment Variables

For production, configure these in Vercel dashboard:

- `NEXT_PUBLIC_GA_ID` - Google Analytics ID (optional)

## Project Structure

```
emoji-directory/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
├── data/                  # Generated emoji index
├── assets/                # Emoji assets
└── messages/              # i18n translations
```

## License

Fluent Emoji assets are provided by Microsoft.

## Contributing

Issues and Pull Requests are welcome!
