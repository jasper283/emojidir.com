export const PLATFORM_PAGE_SIZE = 56;

export function parsePlatformPage(value?: string): number {
  const page = Number.parseInt(value || '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function buildPlatformPageHref(
  basePath: string,
  page: number,
  searchQuery = '',
  category = 'all'
): string {
  const params = new URLSearchParams();
  const normalizedSearch = searchQuery.trim();
  const normalizedCategory = category.trim();

  if (normalizedSearch) {
    params.set('search', normalizedSearch);
  }
  if (normalizedCategory && normalizedCategory !== 'all') {
    params.set('category', normalizedCategory);
  }
  if (page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
