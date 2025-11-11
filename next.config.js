const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 output: 'export' 以支持完整的 Next.js 功能
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 配置远程图片域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'public.emojidir.com',
      },
      {
        protocol: 'https',
        hostname: 'object.emojidir.com',
      },
    ],
    // 启用图片优化缓存
    minimumCacheTTL: 31536000,
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // 优化静态资源缓存
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
}

module.exports = withNextIntl(nextConfig)

