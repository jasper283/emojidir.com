const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 output: 'export' 以支持完整的 Next.js 功能
  images: {
    // 关闭图片优化，避免使用付费服务
    unoptimized: true,
    // 配置远程图片域名（即使关闭优化，仍然需要配置域名以允许加载）
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

