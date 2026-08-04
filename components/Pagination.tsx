'use client';

import { buildPlatformPageHref } from '@/lib/platform-pagination';
import { buttonVariants } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  basePath: string;
  searchQuery?: string;
  category?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  basePath,
  searchQuery = '',
  category = 'all',
}: PaginationProps) {
  const t = useTranslations('pagination');

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const getPageHref = (page: number) =>
    buildPlatformPageHref(basePath, page, searchQuery, category);
  const iconLinkClass = buttonVariants({ variant: 'outline', size: 'icon' });

  // 生成页码数组（根据屏幕大小调整）
  const getPageNumbers = (isMobile: boolean = false) => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = isMobile ? 3 : 7; // 移动端显示更少页码

    if (totalPages <= maxVisiblePages) {
      // 如果总页数较少，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (isMobile) {
        // 移动端：只显示当前页及前后各一页
        if (currentPage > 1) {
          pages.push(1);
          if (currentPage > 2) pages.push('...');
        }

        pages.push(currentPage);

        if (currentPage < totalPages) {
          if (currentPage < totalPages - 1) pages.push('...');
          pages.push(totalPages);
        }
      } else {
        // 桌面端：显示更多页码
        pages.push(1);

        if (currentPage > 3) {
          pages.push('...');
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        if (currentPage < totalPages - 2) {
          pages.push('...');
        }

        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
      {/* 显示当前范围 */}
      <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
        {t('showing', { start: startItem, end: endItem, total: totalItems })}
      </div>

      {/* 分页按钮 */}
      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
        {/* 首页按钮 - 桌面端显示 */}
        {currentPage === 1 ? (
          <span className={`${iconLinkClass} hidden sm:flex h-9 w-9 opacity-50`} aria-disabled="true">
            <ChevronsLeft className="h-4 w-4" />
          </span>
        ) : (
          <Link href={getPageHref(1)} className={`${iconLinkClass} hidden sm:flex h-9 w-9`} aria-label={t('first')}>
            <ChevronsLeft className="h-4 w-4" />
          </Link>
        )}

        {/* 上一页按钮 */}
        {currentPage === 1 ? (
          <span className={`${iconLinkClass} h-8 w-8 sm:h-9 sm:w-9 opacity-50`} aria-disabled="true">
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </span>
        ) : (
          <Link href={getPageHref(currentPage - 1)} className={`${iconLinkClass} h-8 w-8 sm:h-9 sm:w-9`} aria-label={t('previous')}>
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        )}

        {/* 页码按钮 - 桌面端 */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers(false).map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground text-sm">
                  ...
                </span>
              );
            }

            return (
              <Link
                key={page}
                href={getPageHref(page as number)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`${buttonVariants({ variant: currentPage === page ? 'default' : 'outline' })} h-9 w-9`}
              >
                {page}
              </Link>
            );
          })}
        </div>

        {/* 页码按钮 - 移动端 */}
        <div className="flex sm:hidden items-center gap-1">
          {getPageNumbers(true).map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground text-xs">
                  ...
                </span>
              );
            }

            return (
              <Link
                key={page}
                href={getPageHref(page as number)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`${buttonVariants({ variant: currentPage === page ? 'default' : 'outline' })} h-8 w-8 text-xs`}
              >
                {page}
              </Link>
            );
          })}
        </div>

        {/* 下一页按钮 */}
        {currentPage === totalPages ? (
          <span className={`${iconLinkClass} h-8 w-8 sm:h-9 sm:w-9 opacity-50`} aria-disabled="true">
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </span>
        ) : (
          <Link href={getPageHref(currentPage + 1)} className={`${iconLinkClass} h-8 w-8 sm:h-9 sm:w-9`} aria-label={t('next')}>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        )}

        {/* 末页按钮 - 桌面端显示 */}
        {currentPage === totalPages ? (
          <span className={`${iconLinkClass} hidden sm:flex h-9 w-9 opacity-50`} aria-disabled="true">
            <ChevronsRight className="h-4 w-4" />
          </span>
        ) : (
          <Link href={getPageHref(totalPages)} className={`${iconLinkClass} hidden sm:flex h-9 w-9`} aria-label={t('last')}>
            <ChevronsRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
