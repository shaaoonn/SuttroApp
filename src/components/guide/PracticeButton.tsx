'use client';

import { useRouter } from 'next/navigation';

interface Props {
  href: string;
}

export default function PracticeButton({ href }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(href);
      }}
      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold suttro-transition hover:opacity-80"
      style={{
        background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(13,148,136,0.2)',
      }}
    >
      অনুশীলন →
    </button>
  );
}
