'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Emoji } from '@/types/emoji';
import { useTranslations } from 'next-intl';

interface CategoryTabsProps {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
  emojisByCategory: Record<string, Emoji[]>;
}

export default function CategoryTabs({
  categories,
  selected,
  onChange,
  emojisByCategory
}: CategoryTabsProps) {
  // 计算所有emoji总数
  const totalCount = Object.values(emojisByCategory).reduce(
    (sum, emojis) => sum + emojis.length,
    0
  );

  const t = useTranslations('common');
  const tShort = useTranslations('common.categoryShortNames');

  // 获取分类的简短名称（用于移动端）
  const getCategoryShortName = (category: string): string => {
    return tShort(category as any) || category;
  };

  return (
    <Card className="p-4 shadow-md">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{t('allCategories')}</h3>
      </div>
      <Tabs value={selected} onValueChange={onChange} className="w-full">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <TabsList className="inline-flex w-auto h-auto flex-wrap gap-2 bg-muted/50 p-2 rounded-lg">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <span className="mr-2 text-lg">🎨</span>
              <span className="hidden sm:inline">{t('all')}</span>
              <span className="sm:hidden">{t('all')}</span>
              <Badge variant="secondary" className="ml-2 bg-background">
                {totalCount}
              </Badge>
            </TabsTrigger>
            {categories.map((category) => {
              const count = emojisByCategory[category]?.length || 0;
              const emoji = getCategoryEmoji(category);
              const shortName = getCategoryShortName(category);

              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 hover:scale-105"
                  title={category}
                >
                  {emoji && <span className="mr-2 text-lg">{emoji}</span>}
                  <span className="hidden sm:inline">{category}</span>
                  <span className="sm:hidden">{shortName}</span>
                  <Badge variant="secondary" className="ml-2 bg-background">
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </Tabs>
    </Card>
  );
}

// 根据分类名称返回对应的emoji
function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'Smileys & Emotion': '😀',
    'People & Body': '👋',
    'Animals & Nature': '🐶',
    'Food & Drink': '🍎',
    'Travel & Places': '✈️',
    'Activities': '⚽',
    'Objects': '💡',
    'Symbols': '❤️',
    'Flags': '🏁',
    'Component': '🔧'
  };

  return emojiMap[category] || '📦';
}

