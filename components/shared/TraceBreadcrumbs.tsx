'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

function segmentToTitle(seg: string) {
  if (!seg) return 'Home';
  // replace - and _ with spaces and title case
  return seg.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TraceBreadcrumbs() {
  const pathname = usePathname() || '/';
  const parts = pathname.split('/').filter(Boolean);

  // Build cumulative paths
  const crumbs = [{ label: 'Home', href: '/' }];
  parts.forEach((p, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/');
    crumbs.push({ label: segmentToTitle(p), href });
  });

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-2">
      <ol className="flex items-center gap-2">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center">
            {i !== 0 && <span className="mx-2 text-gray-300">/</span>}
            <Link href={c.href} className="hover:underline">
              {c.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
