import { locales } from '@/i18n/config';
import { PLATFORM_CONFIGS } from '@/lib/platforms';
import type { PlatformType } from '@/types/emoji';
import type { Metadata } from 'next';

const baseUrl = 'https://emojidir.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; platform: string }>;
}): Promise<Metadata> {
  const { locale, platform: platformSlug } = await params;
  const platformId = platformSlug?.replace('-emoji', '') as PlatformType;
  const platformConfig = PLATFORM_CONFIGS[platformId];

  if (!platformConfig) {
    return {};
  }

  // 平台名称和描述的多语言版本
  const platformMetadata: Record<string, Record<string, { name: string; description: string; keywords: string }>> = {
    'en': {
      'fluent': {
        name: 'Microsoft 3D Fluent Emoji Emojis — Copy, Paste & Download All Emojis',
        description: 'Browse and download all Microsoft 3D Fluent Emoji emojis. Easily copy & paste emojis for free. Perfect for messages, social media, and projects.',
        keywords: 'Microsoft 3D Fluent Emoji, Microsoft Emoji, 3D Emoji, Windows Emoji, copy paste emoji, download emoji'
      },
      'nato': {
        name: 'Noto Emoji Emojis — Copy, Paste & Download All Emojis',
        description: 'Browse and download all Noto Emoji emojis. Easily copy & paste emojis for free. Perfect for messages, social media, and projects.',
        keywords: 'Noto Emoji, Google Emoji, Android Emoji, Flat Emoji, copy paste emoji, download emoji'
      },
      'unicode': {
        name: 'System Emoji Emojis — Copy, Paste & Download All Emojis',
        description: 'Browse and download all System Emoji emojis. Easily copy & paste emojis for free. Perfect for messages, social media, and projects.',
        keywords: 'System Emoji, Unicode Emoji, Native Emoji, Default Emoji, copy paste emoji, download emoji'
      }
    },
    'zh-CN': {
      'fluent': {
        name: '微软 3D Fluent Emoji — 复制、粘贴和下载所有表情',
        description: '浏览和下载所有 Microsoft 3D Fluent Emoji 表情符号。轻松免费复制粘贴表情。非常适合消息、社交媒体和项目。',
        keywords: 'Microsoft 3D Fluent Emoji, 微软表情, 3D表情, Windows表情, 复制粘贴表情, 下载表情'
      },
      'nato': {
        name: 'Noto Emoji 表情符号 — 复制、粘贴和下载所有表情',
        description: '浏览和下载所有 Noto Emoji 表情符号。轻松免费复制粘贴表情。非常适合消息、社交媒体和项目。',
        keywords: 'Noto Emoji, 谷歌表情, 安卓表情, 扁平表情, 复制粘贴表情, 下载表情'
      },
      'unicode': {
        name: '系统 Emoji 表情符号 — 复制、粘贴和下载所有表情',
        description: '浏览和下载所有系统 Emoji 表情符号。轻松免费复制粘贴表情。非常适合消息、社交媒体和项目。',
        keywords: '系统表情, Unicode表情, 原生表情, 默认表情, 复制粘贴表情, 下载表情'
      }
    },
    'zh-TW': {
      'fluent': {
        name: 'Microsoft 3D Fluent Emoji 表情符號 — 複製、貼上和下載所有表情',
        description: '瀏覽和下載所有 Microsoft 3D Fluent Emoji 表情符號。輕鬆免費複製貼上表情。非常適合訊息、社交媒體和專案。',
        keywords: 'Microsoft 3D Fluent Emoji, 微軟表情, 3D表情, Windows表情, 複製貼上表情, 下載表情'
      },
      'nato': {
        name: 'Noto Emoji 表情符號 — 複製、貼上和下載所有表情',
        description: '瀏覽和下載所有 Noto Emoji 表情符號。輕鬆免費複製貼上表情。非常適合訊息、社交媒體和專案。',
        keywords: 'Noto Emoji, 谷歌表情, 安卓表情, 扁平表情, 複製貼上表情, 下載表情'
      },
      'unicode': {
        name: '系統 Emoji 表情符號 — 複製、貼上和下載所有表情',
        description: '瀏覽和下載所有系統 Emoji 表情符號。輕鬆免費複製貼上表情。非常適合訊息、社交媒體和專案。',
        keywords: '系統表情, Unicode表情, 原生表情, 預設表情, 複製貼上表情, 下載表情'
      }
    },
    'ja': {
      'fluent': {
        name: 'Microsoft 3D Fluent Emoji 絵文字 — すべての絵文字をコピー、ペースト、ダウンロード',
        description: 'すべてのMicrosoft 3D Fluent Emoji絵文字を閲覧してダウンロード。無料で簡単にコピー＆ペースト。メッセージ、ソーシャルメディア、プロジェクトに最適。',
        keywords: 'Microsoft 3D Fluent Emoji, Microsoft絵文字, 3D絵文字, Windows絵文字, コピペ絵文字, ダウンロード絵文字'
      },
      'nato': {
        name: 'Noto Emoji 絵文字 — すべての絵文字をコピー、ペースト、ダウンロード',
        description: 'すべてのNoto Emoji絵文字を閲覧してダウンロード。無料で簡単にコピー＆ペースト。メッセージ、ソーシャルメディア、プロジェクトに最適。',
        keywords: 'Noto Emoji, Google絵文字, Android絵文字, フラット絵文字, コピペ絵文字, ダウンロード絵文字'
      },
      'unicode': {
        name: 'システム Emoji 絵文字 — すべての絵文字をコピー、ペースト、ダウンロード',
        description: 'すべてのシステムEmoji絵文字を閲覧してダウンロード。無料で簡単にコピー＆ペースト。メッセージ、ソーシャルメディア、プロジェクトに最適。',
        keywords: 'システム絵文字, Unicode絵文字, ネイティブ絵文字, デフォルト絵文字, コピペ絵文字, ダウンロード絵文字'
      }
    },
    'ko': {
      'fluent': {
        name: 'Microsoft 3D Fluent Emoji 이모지 — 모든 이모지 복사, 붙여넣기 및 다운로드',
        description: '모든 Microsoft 3D Fluent Emoji 이모지를 탐색하고 다운로드하세요. 무료로 쉽게 복사 및 붙여넣기. 메시지, 소셜 미디어 및 프로젝트에 완벽합니다.',
        keywords: 'Microsoft 3D Fluent Emoji, Microsoft 이모지, 3D 이모지, Windows 이모지, 복사 붙여넣기 이모지, 다운로드 이모지'
      },
      'nato': {
        name: 'Noto Emoji 이모지 — 모든 이모지 복사, 붙여넣기 및 다운로드',
        description: '모든 Noto Emoji 이모지를 탐색하고 다운로드하세요. 무료로 쉽게 복사 및 붙여넣기. 메시지, 소셜 미디어 및 프로젝트에 완벽합니다.',
        keywords: 'Noto Emoji, Google 이모지, Android 이모지, 플랫 이모지, 복사 붙여넣기 이모지, 다운로드 이모지'
      },
      'unicode': {
        name: '시스템 Emoji 이모지 — 모든 이모지 복사, 붙여넣기 및 다운로드',
        description: '모든 시스템 Emoji 이모지를 탐색하고 다운로드하세요. 무료로 쉽게 복사 및 붙여넣기. 메시지, 소셜 미디어 및 프로젝트에 완벽합니다.',
        keywords: '시스템 이모지, Unicode 이모지, 네이티브 이모지, 기본 이모지, 복사 붙여넣기 이모지, 다운로드 이모지'
      }
    },
    'pt-BR': {
      'fluent': {
        name: 'Microsoft 3D Fluent Emoji Emojis — Copiar, Colar e Baixar Todos os Emojis',
        description: 'Navegue e baixe todos os emojis Microsoft 3D Fluent Emoji. Copie e cole emojis gratuitamente com facilidade. Perfeito para mensagens, redes sociais e projetos.',
        keywords: 'Microsoft 3D Fluent Emoji, Microsoft Emoji, 3D Emoji, Windows Emoji, copiar colar emoji, baixar emoji'
      },
      'nato': {
        name: 'Noto Emoji Emojis — Copiar, Colar e Baixar Todos os Emojis',
        description: 'Navegue e baixe todos os emojis Noto Emoji. Copie e cole emojis gratuitamente com facilidade. Perfeito para mensagens, redes sociais e projetos.',
        keywords: 'Noto Emoji, Google Emoji, Android Emoji, Flat Emoji, copiar colar emoji, baixar emoji'
      },
      'unicode': {
        name: 'Sistema Emoji Emojis — Copiar, Colar e Baixar Todos os Emojis',
        description: 'Navegue e baixe todos os emojis do Sistema. Copie e cole emojis gratuitamente com facilidade. Perfeito para mensagens, redes sociais e projetos.',
        keywords: 'Sistema Emoji, Unicode Emoji, Emoji Nativo, Emoji Padrão, copiar colar emoji, baixar emoji'
      }
    }
  };

  const localeMetadata = platformMetadata[locale]?.[platformId] || platformMetadata['en'][platformId];
  const title = localeMetadata.name;
  const description = localeMetadata.description;
  const keywords = localeMetadata.keywords;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${baseUrl}/${locale}/${platformSlug}`,
      languages: Object.fromEntries(
        locales.map(loc => [loc, `${baseUrl}/${loc}/${platformSlug}`])
      ),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/${platformSlug}`,
      type: 'website',
      locale,
      siteName: 'EmojiDir',
      images: [
        {
          url: 'https://public.emojidir.com/og/welcome.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://public.emojidir.com/og/welcome.png'],
    },
  };
}

export async function generateStaticParams() {
  const platforms = Object.keys(PLATFORM_CONFIGS);
  const params = [];

  for (const locale of locales) {
    for (const platform of platforms) {
      params.push({
        locale,
        platform: `${platform}-emoji`
      });
    }
  }

  return params;
}

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

