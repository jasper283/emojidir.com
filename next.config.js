const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages serves the generated files directly. Keep runtime work
  // out of the request path so traffic cannot create ISR or Function usage.
  output: 'export',
  trailingSlash: true,
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
}

module.exports = withNextIntl(nextConfig)
