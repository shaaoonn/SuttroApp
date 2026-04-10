import type { Metadata } from 'next';
import Link from 'next/link';
import { getClasses, getChapterNames } from '@/lib/data';
import ClassesFilter from '@/components/classes/ClassesFilter';
import { SUBJECT_COLORS, SUBJECT_LABELS, SUBJECT_ICONS, ytThumb } from '@/lib/constants';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'ক্লাস আর্কাইভ — সূত্র | suttro.app',
};

export default async function ClassesPage() {
  const [classes, chapterNames] = await Promise.all([
    getClasses(),
    getChapterNames(),
  ]);

  return (
    <div style={{ background: '#F8FAFC' }}>
      {/* ═══════════════════════════════════════
          Mobile: Compact class archive
          ═══════════════════════════════════════ */}
      <div className="lg:hidden">
        <div className="px-4 py-3 flex flex-col gap-3">
          {/* Page header */}
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#1E293B' }}>
              ক্লাস আর্কাইভ
            </h1>
            <p className="text-[13px]" style={{ color: '#94A3B8' }}>
              বিষয় ও অধ্যায় ধরে ফিল্টার করো
            </p>
          </div>

          <ClassesFilter classes={classes} chapterNames={chapterNames} />
        </div>
      </div>

      {/* ═══════════════════════════════════════
          Desktop: Full layout preserved
          ═══════════════════════════════════════ */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#134E4A' }}>
            ক্লাস আর্কাইভ
          </h1>
          <p className="text-base mb-8" style={{ color: '#94A3B8' }}>
            প্রতিদিনের ক্লাস রেকর্ডিং — বিষয় ও অধ্যায় ধরে ফিল্টার করো, যখন খুশি দেখো।
          </p>

          <ClassesFilter classes={classes} chapterNames={chapterNames} />

          <div
            className="rounded-[14px] p-8 text-center mt-8"
            style={{ background: '#F0FDFA' }}
          >
            <div className="text-3xl mb-3">📹</div>
            <p className="text-base font-medium mb-2" style={{ color: '#134E4A' }}>
              প্রতিদিন নতুন ক্লাস যোগ হচ্ছে
            </p>
            <p className="text-base" style={{ color: '#94A3B8' }}>
              ৬টি বিষয়ে {classes.length}টি ক্লাস রেকর্ডিং এখন দেখার জন্য প্রস্তুত।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
