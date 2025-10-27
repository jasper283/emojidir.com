'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <span className="text-3xl">😊</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Emoji Directory
              </span>
            </div>
            <p className="text-sm/6 text-balance text-gray-600 dark:text-gray-400">
              {t('description')}
            </p>
            <div className="flex gap-x-6 hidden">
              <a
                href="https://github.com/yourusername/find-emoji"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <span className="sr-only">GitHub</span>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-6">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" fillRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://twitter.com/emojidir"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <span className="sr-only">X (Twitter)</span>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-6">
                  <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                {t('sections.resources')}
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <Link
                    href="/en/fluent"
                    className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Fluent Emoji
                  </Link>
                </li>
                <li>
                  <Link
                    href="/en/nato"
                    className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Noto Emoji
                  </Link>
                </li>
                <li>
                  <Link
                    href="/en/unicode-emoji"
                    className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {t('links.unicodePlatform')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/en"
                    className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {t('links.allEmojis')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                {t('sections.legal')}
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {t('links.privacy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {t('links.terms')}
                  </Link>
                </li>
                <li className="hidden">
                  <Link
                    href="/en/blog"
                    className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {t('links.license')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                {t('sections.credits')}
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <a
                    href="https://github.com/microsoft/fluentui-emoji"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {t('links.fluentEmoji')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/googlefonts/noto-emoji"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {t('links.notoEmoji')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24 dark:border-white/10">
          <p className="text-sm/6 text-gray-600 dark:text-gray-400">
            &copy; {currentYear} Emoji Directory. {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}

