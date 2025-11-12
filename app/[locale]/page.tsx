import { locales } from '@/i18n/config';
import type { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';

const baseUrl = 'https://emojidir.com';

// 添加 generateMetadata 以优化 SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const metadataByLocale: Record<string, {
    title: string;
    description: string;
    keywords: string;
  }> = {
    'en': {
      title: 'Free Emoji Directory - Copy, Paste & Download All Emojis',
      description: 'Explore thousands of emojis. Copy, paste, and download emojis from Microsoft Fluent, Google Noto, and system platforms for free. Perfect for messages and projects.',
      keywords: 'emoji copy paste, emoji download, free emoji, fluent emoji, noto emoji, emoji directory, emoji search, microsoft emoji, google emoji'
    },
    'zh-CN': {
      title: '免费 Emoji 表情符号 - 复制、粘贴和下载所有表情',
      description: '探索数千个表情符号。免费复制、粘贴和下载来自 Microsoft Fluent、Google Noto 和系统平台的表情。完美适用于消息和项目。',
      keywords: '表情复制粘贴, 表情下载, 免费表情, fluent emoji, noto emoji, 表情目录, 表情搜索, 微软表情, 谷歌表情'
    },
    'zh-TW': {
      title: '免費 Emoji 表情符號 - 複製、貼上和下載所有表情',
      description: '探索數千個表情符號。免費複製、貼上和下載來自 Microsoft Fluent、Google Noto 和系統平台的表情。完美適用於訊息和專案。',
      keywords: '表情複製貼上, 表情下載, 免費表情, fluent emoji, noto emoji, 表情目錄, 表情搜尋, 微軟表情, 谷歌表情'
    },
    'ja': {
      title: '無料 Emoji ディレクトリ - すべての絵文字をコピー、貼り付け、ダウンロード',
      description: '数千の絵文字を探索。Microsoft Fluent、Google Noto、システムプラットフォームから無料で絵文字をコピー、貼り付け、ダウンロード。メッセージやプロジェクトに最適。',
      keywords: '絵文字コピペ, 絵文字ダウンロード, 無料絵文字, fluent emoji, noto emoji, 絵文字ディレクトリ, 絵文字検索, マイクロソフト絵文字, グーグル絵文字'
    },
    'ko': {
      title: '무료 Emoji 디렉토리 - 모든 이모지 복사, 붙여넣기 및 다운로드',
      description: '수천 개의 이모지를 탐색하세요. Microsoft Fluent, Google Noto 및 시스템 플랫폼에서 무료로 이모지를 복사, 붙여넣기 및 다운로드하세요. 메시지 및 프로젝트에 완벽합니다.',
      keywords: '이모지 복사 붙여넣기, 이모지 다운로드, 무료 이모지, fluent emoji, noto emoji, 이모지 디렉토리, 이모지 검색, 마이크로소프트 이모지, 구글 이모지'
    },
    'pt-BR': {
      title: 'Diretório de Emoji Gratuito - Copiar, Colar e Baixar Todos os Emojis',
      description: 'Explore milhares de emojis. Copie, cole e baixe emojis do Microsoft Fluent, Google Noto e plataformas de sistema gratuitamente. Perfeito para mensagens e projetos.',
      keywords: 'copiar colar emoji, baixar emoji, emoji grátis, fluent emoji, noto emoji, diretório emoji, busca emoji, microsoft emoji, google emoji'
    },
  };

  const metadata = metadataByLocale[locale] || metadataByLocale['en'];

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords.split(', '),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: Object.fromEntries(
        locales.map(loc => [loc, `${baseUrl}/${loc}`])
      ),
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `${baseUrl}/${locale}`,
      type: 'website',
      locale,
      siteName: 'Emoji Directory',
      images: [{
        url: 'https://public.emojidir.com/og/welcome.png',
        width: 1200,
        height: 630,
        alt: 'Emoji Directory - Free Emoji Copy & Download',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: ['https://public.emojidir.com/og/welcome.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// 服务端组件
export default function LandingPage() {
  return <LandingPageClient />;
}

