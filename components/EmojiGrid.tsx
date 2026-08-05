'use client';

import { Card } from '@/components/ui/card';
import type { Emoji, StyleType } from '@/types/emoji';
import { SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import EmojiCard from './EmojiCard';

interface EmojiGridProps {
  emojis: Emoji[];
  style: StyleType;
}

// 首屏优先加载的emoji数量（移动端2列×3行=6，桌面端可能更多，取16个保险）
const PRIORITY_LOAD_COUNT = 16;

export default function EmojiGrid({ emojis, style }: EmojiGridProps) {
  const t = useTranslations('search');

  if (emojis.length === 0) {
    return (
      <Card className="p-10 sm:p-16 md:p-20">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="clay-inset flex h-20 w-20 items-center justify-center rounded-full">
            <SearchX className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h3 className="font-display mb-2 text-xl font-semibold">{t('noResults')}</h3>
            <p className="font-semibold text-muted-foreground">{t('tryDifferentKeywords')}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 md:gap-4">
      {emojis.map((emoji, index) => (
        <EmojiCard
          key={emoji.id}
          emoji={emoji}
          style={style}
          priority={index < PRIORITY_LOAD_COUNT}
        />
      ))}
    </div>
  );
}
