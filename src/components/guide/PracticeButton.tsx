'use client';

import Link from 'next/link';

interface Props {
  href: string;
}

export default function PracticeButton({ href }: Props) {
  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="px-2.5 py-0.5 rounded text-xs font-medium suttro-transition hover:opacity-80"
      style={{ background: 'var(--suttro-primary)', color: 'white' }}
    >
      অনুশীলন →
    </Link>
  );
}
