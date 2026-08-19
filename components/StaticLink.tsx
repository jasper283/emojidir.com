import type { AnchorHTMLAttributes } from 'react';

interface StaticLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export default function StaticLink({ href, ...props }: StaticLinkProps) {
  return <a href={href} {...props} />;
}
