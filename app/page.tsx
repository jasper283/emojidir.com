import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

// 根路径的 metadata - 设置为 noindex 以避免与语言页面冲突
export const metadata: Metadata = {
  title: 'Emoji Directory - Free Emoji Copy & Download',
  description: 'Explore thousands of emojis from multiple platforms',
  robots: {
    index: false, // 不索引根路径，只索引语言页面
    follow: true,
  },
};

// 重定向到默认语言页面
export default function RootPage() {
  redirect('/en');
}

