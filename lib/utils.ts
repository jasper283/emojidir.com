import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type OSType = 'macos' | 'ios' | 'windows' | 'android' | 'linux' | 'unknown';

export interface OSInfo {
  type: OSType;
  name: string;
  icon: string;
  supportsNativeEmoji: boolean;
}

/**
 * 检测用户的操作系统
 */
export function detectOS(): OSInfo {
  if (typeof window === 'undefined') {
    return { type: 'unknown', name: 'Unknown System', icon: '💻', supportsNativeEmoji: false };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';

  // 检测 iOS/iPadOS
  const isIOS = /iphone|ipod/.test(userAgent) ||
    (/ipad/.test(userAgent)) ||
    (platform === 'macintel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    return {
      type: 'ios',
      name: 'iOS / iPadOS',
      icon: '📱',
      supportsNativeEmoji: true
    };
  }

  // 检测 macOS
  const isMac = /mac|macintosh|mac os x/.test(userAgent) || /mac/.test(platform);
  if (isMac) {
    return {
      type: 'macos',
      name: 'macOS',
      icon: '🍎',
      supportsNativeEmoji: true
    };
  }

  // 检测 Android
  const isAndroid = /android/.test(userAgent);
  if (isAndroid) {
    return {
      type: 'android',
      name: 'Android',
      icon: '🤖',
      supportsNativeEmoji: true // Android 使用 Noto Emoji
    };
  }

  // 检测 Windows
  const isWindows = /windows|win32|win64|wow64/.test(userAgent) || /win/.test(platform);
  if (isWindows) {
    return {
      type: 'windows',
      name: 'Windows',
      icon: '🪟',
      supportsNativeEmoji: true // Windows 使用 Segoe UI Emoji
    };
  }

  // 检测 Linux
  const isLinux = /linux/.test(userAgent) || /linux/.test(platform);
  if (isLinux) {
    return {
      type: 'linux',
      name: 'Linux',
      icon: '🐧',
      supportsNativeEmoji: false
    };
  }

  return {
    type: 'unknown',
    name: 'Unknown System',
    icon: '💻',
    supportsNativeEmoji: false
  };
}

/**
 * 检测用户是否在 Apple 设备上（macOS、iOS、iPadOS）
 * @deprecated 使用 detectOS() 替代
 */
export function isAppleDevice(): boolean {
  const os = detectOS();
  return os.type === 'macos' || os.type === 'ios';
}

