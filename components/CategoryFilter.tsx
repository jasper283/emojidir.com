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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('category')}
      </label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

