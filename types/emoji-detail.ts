import type {
  Emoji,
  EmojiSeoData,
  EmojipediaEmojiData,
  PlatformType,
} from '@/types/emoji';

export interface EmojiDetailData {
  emoji: Emoji;
  seoData?: EmojiSeoData;
  emojipediaData?: EmojipediaEmojiData;
  otherPlatforms: Array<{
    platform: PlatformType;
    emoji: Emoji | undefined;
    name: string;
  }>;
  variantEmojis: Emoji[];
  pngAssetPath?: string;
  platform: PlatformType;
}
