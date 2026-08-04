'use client';

import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
}

export default function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  const t = useTranslations('common');
  const submit = () => onSubmit?.(value);

  return (
    <form
      className="relative w-full"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="pl-10 pr-10 h-10 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onSubmit?.('');
          }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="清除搜索"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
