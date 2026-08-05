'use client';

import type { Emoji } from '@/types/emoji';
import { useTranslations } from 'next-intl';

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
  emojisByCategory: Record<string, Emoji[]>;
}

export default function CategoryFilter({
  categories,
  selected,
  onChange,
  emojisByCategory
}: CategoryFilterProps) {
  const t = useTranslations('common');

  return (
    <div className="flex-1">
      <label className="mb-2 block text-sm font-bold text-foreground">
        {t('category')}
      </label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="clay-inset w-full px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="all">{t('allCategories')}</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category} ({emojisByCategory[category]?.length || 0})
          </option>
        ))}
      </select>
    </div>
  );
}
