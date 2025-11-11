import PlatformPageClient from '@/components/PlatformPageClient';
import { CollectionPageStructuredData } from '@/components/StructuredData';
import { loadEmojiIndexServer } from '@/lib/emoji-server';
import { getEmojiDataForPlatform } from '@/lib/platforms';
import type { PlatformType } from '@/types/emoji';
import { useTranslations } from 'next-intl';

interface PlatformPageProps {
  params: Promise<{
    locale: string;
    platform: string;
  }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { locale, platform: platformSlug } = await params;
  const selectedPlatform = platformSlug?.replace('-emoji', '') as PlatformType || 'fluent';

  // 在服务端加载和合并语言数据
  const localizedEmojiData = await loadEmojiIndexServer(locale);

  // 根据选择的平台获取对应的emoji数据
  const emojiData = getEmojiDataForPlatform(selectedPlatform, localizedEmojiData);

  return (
    <>
      {/* JSON-LD结构化数据 */}
      <CollectionPageStructuredDataWrapper
        locale={locale}
        platform={platformSlug}
        selectedPlatform={selectedPlatform}
        totalEmojis={emojiData.emojis.length}
      />

      {/* 客户端交互组件 */}
      <PlatformPageClient
        emojiData={emojiData}
        selectedPlatform={selectedPlatform}
        locale={locale}
      />
    </>
  );
}

// 单独的结构化数据组件（客户端组件用于翻译）
function CollectionPageStructuredDataWrapper({
  locale,
  platform,
  selectedPlatform,
  totalEmojis
}: {
  locale: string;
  platform: string;
  selectedPlatform: PlatformType;
  totalEmojis: number;
}) {
  const t = useTranslations();

  return (
    <CollectionPageStructuredData
      locale={locale}
      platform={platform}
      platformName={t(`platforms.${selectedPlatform}`)}
      platformDescription={t(`platformDescriptions.${selectedPlatform}`)}
      totalEmojis={totalEmojis}
    />
  );
}
