/**
 * CDN 配置
 * 如果设置了 R2_PUBLIC_CDN_URL，将从 CDN 加载资源
 * 否则从本地 assets 加载
 */

// export const CDN_URL = process.env.R2_PUBLIC_CDN_URL || '';
export const CDN_URL = 'https://object.emojidir.com';

/**
 * 获取资源的完整 URL
 * @param path 相对路径，如 "assets/Smiling face/3D/xxx.png"
 */
export function getAssetUrl(path: string): string {
  if (CDN_URL) {
    // 从 CDN 加载 - 对路径进行 URL 编码，但保留斜杠
    const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `${CDN_URL}/${encodedPath}`;
  }
  // 从本地加载 - 浏览器会自动处理
  return `/${path}`;
}

