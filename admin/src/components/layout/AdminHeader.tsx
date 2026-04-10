'use client';

import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/': 'ড্যাশবোর্ড',
  '/daily-lessons': 'আজকের পড়া',
  '/daily-lessons/new': 'নতুন পড়া তৈরি',
  '/daily-lessons/reviews': 'জমা মূল্যায়ন',
  '/classes': 'ক্লাস ম্যানেজমেন্ট',
  '/classes/new': 'নতুন ক্লাস তৈরি',
  '/exams': 'MCQ পরীক্ষা',
  '/exams/new': 'নতুন পরীক্ষা তৈরি',
  '/cq': 'সৃজনশীল প্রশ্ন',
  '/questions/import': 'CSV ইম্পোর্ট',
  '/users': 'ইউজার ম্যানেজমেন্ট',
  '/content': 'সাইট কন্টেন্ট',
  '/analytics': 'অ্যানালিটিক্স',
};

export default function AdminHeader() {
  const pathname = usePathname();

  // Match exact or closest parent path
  const title = PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES)
      .filter(([p]) => p !== '/' && pathname.startsWith(p))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ||
    'সূত্র Admin';

  return (
    <header
      className="h-16 flex items-center px-8 border-b"
      style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-card)' }}
    >
      <h1 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>
        {title}
      </h1>
    </header>
  );
}
