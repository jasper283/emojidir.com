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
        name: 'Fluent Emoji — Microsoft 3D Emoji Style | EmojiDir',
        description: 'Explore Microsoft\'s Fluent Emoji — a modern 3D emoji set designed for Windows and Microsoft products. Browse, search, and download high-quality PNG and SVG files.',
        keywords: 'Fluent Emoji, Microsoft Emoji, 3D Emoji, Windows Emoji, EmojiDir'
      },
      'nato': {
        name: 'Noto Emoji — Google Flat Emoji Style | EmojiDir',
        description: 'Discover Google\'s Noto Emoji — a flat, minimalist emoji set used across Android and Google platforms. Search and download emoji in PNG and SVG formats.',
        keywords: 'Noto Emoji, Google Emoji, Android Emoji, Flat Emoji, EmojiDir'
      },
      'unicode': {
        name: 'System Emoji — Native Unicode Emoji Style | EmojiDir',
        description: 'View emojis as they appear on your device. System Emoji are displayed using your platform\'s native Unicode rendering. Compare how emojis look across different systems.',
        keywords: 'System Emoji, Unicode Emoji, Native Emoji, Default Emoji, EmojiDir'
      }
    },
    'zh-CN': {
      'fluent': {
        name: 'Fluent Emoji 3D 表情合集｜微软风格 Emoji 下载',
        description: '微软推出的 Fluent 3D Emoji 系列，风格精致可爱，适合网页、设计、演示等多种场景使用。浏览、搜索和下载高质量的 PNG 和 SVG 文件。',
        keywords: 'fluent emoji, 3d emoji, 微软emoji, 3d表情, EmojiDir'
      },
      'nato': {
        name: 'Noto Emoji — Google Flat Emoji Style | EmojiDir',
        description: '发现谷歌的 Noto Emoji — 在 Android 和谷歌平台上使用的扁平、极简表情符号集。搜索和下载 PNG、SVG 格式的表情符号。',
        keywords: 'Noto Emoji, Google Emoji, Android Emoji, Flat Emoji, EmojiDir'
      },
      'unicode': {
        name: '系统 Emoji 素材库｜苹果、安卓、微软原生表情大全',
        description: '收录苹果、安卓、微软等多平台系统 Emoji，支持 PNG、SVG 下载。设计师找 Emoji 素材就上 EmojiDir！',
        keywords: '系统emoji, 苹果emoji, 安卓emoji, 微软emoji, emoji下载, emoji素材, emoji大全'
      }
    },
    'zh-TW': {
      'fluent': {
        name: 'Fluent Emoji — Microsoft 3D Emoji Style | EmojiDir',
        description: '探索微軟的 Fluent Emoji — 專為 Windows 和微軟產品設計的現代 3D 表情符號集。瀏覽、搜尋和下載高品質的 PNG 和 SVG 檔案。',
        keywords: 'Fluent Emoji, Microsoft Emoji, 3D Emoji, Windows Emoji, EmojiDir'
      },
      'nato': {
        name: 'Noto Emoji — Google Flat Emoji Style | EmojiDir',
        description: '發現谷歌的 Noto Emoji — 在 Android 和谷歌平台上使用的扁平、極簡表情符號集。搜尋和下載 PNG、SVG 格式的表情符號。',
        keywords: 'Noto Emoji, Google Emoji, Android Emoji, Flat Emoji, EmojiDir'
      },
      'unicode': {
        name: 'System Emoji — Native Unicode Emoji Style | EmojiDir',
        description: '查看表情符號在您裝置上的顯示效果。系統表情符號使用您平台的原生 Unicode 渲染顯示。比較表情符號在不同系統上的外觀。',
        keywords: 'System Emoji, Unicode Emoji, Native Emoji, Default Emoji, EmojiDir'
      }
    },
    'ja': {
      'fluent': {
        name: 'Fluent Emoji — Microsoft 3D Emoji Style | EmojiDir',
        description: 'MicrosoftのFluent Emojiを探索 — WindowsとMicrosoft製品向けに設計されたモダンな3D絵文字セット。高品質なPNGとSVGファイルを閲覧、検索、ダウンロード。',
        keywords: 'Fluent Emoji, Microsoft Emoji, 3D Emoji, Windows Emoji, EmojiDir'
      },
      'nato': {
        name: 'Noto Emoji — Google Flat Emoji Style | EmojiDir',
        description: 'GoogleのNoto Emojiを発見 — AndroidとGoogleプラットフォームで使用されるフラットでミニマルな絵文字セット。PNGとSVG形式で絵文字を検索、ダウンロード。',
        keywords: 'Noto Emoji, Google Emoji, Android Emoji, Flat Emoji, EmojiDir'
      },
      'unicode': {
        name: 'System Emoji — Native Unicode Emoji Style | EmojiDir',
        description: 'デバイスでの絵文字の表示を確認。システム絵文字は、プラットフォームのネイティブUnicodeレンダリングを使用して表示されます。異なるシステムでの絵文字の見た目を比較。',
        keywords: 'System Emoji, Unicode Emoji, Native Emoji, Default Emoji, EmojiDir'
      }
    },
    'ko': {
      'fluent': {
        name: 'Fluent Emoji — Microsoft 3D Emoji Style | EmojiDir',
        description: 'Microsoft의 Fluent Emoji를 탐색하세요 — Windows와 Microsoft 제품을 위해 설계된 현대적인 3D 이모지 세트. 고품질 PNG 및 SVG 파일을 찾아보고 검색하고 다운로드하세요.',
        keywords: 'Fluent Emoji, Microsoft Emoji, 3D Emoji, Windows Emoji, EmojiDir'
      },
      'nato': {
        name: 'Noto Emoji — Google Flat Emoji Style | EmojiDir',
        description: 'Google의 Noto Emoji를 발견하세요 — Android와 Google 플랫폼에서 사용되는 평면적이고 미니멀한 이모지 세트. PNG 및 SVG 형식으로 이모지를 검색하고 다운로드하세요.',
        keywords: 'Noto Emoji, Google Emoji, Android Emoji, Flat Emoji, EmojiDir'
      },
      'unicode': {
        name: 'System Emoji — Native Unicode Emoji Style | EmojiDir',
        description: '기기에서 이모지가 어떻게 보이는지 확인하세요. 시스템 이모지는 플랫폼의 네이티브 Unicode 렌더링을 사용하여 표시됩니다. 다른 시스템에서 이모지의 모습을 비교하세요.',
        keywords: 'System Emoji, Unicode Emoji, Native Emoji, Default Emoji, EmojiDir'
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

