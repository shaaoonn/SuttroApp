import type { Metadata } from 'next';
import { getClasses, getChapterNames } from '@/lib/data';
import { getSiteContent } from '@/lib/site-content';
import ClassesFilter from '@/components/classes/ClassesFilter';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ক্লাস আর্কাইভ — সূত্র | suttro.app',
};

export default async function ClassesPage() {
  const [classes, chapterNames, cms] = await Promise.all([
    getClasses(),
    getChapterNames(),
    getSiteContent('classes'),
  ]);

  return (
    <div style={{ background: '#F8FAFC' }}>
      {/* ═══════════════════════════════════════
          Mobile: Compact class archive
          ═══════════════════════════════════════ */}
      <div className="lg:hidden">
        <div className="px-4 py-3 pb-24 flex flex-col gap-3">
          {/* Page header */}
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#1E293B' }}>
              {cms.page_title || 'ক্লাস আর্কাইভ'}
            </h1>
            <p className="text-[13px]" style={{ color: '#94A3B8' }}>
              {cms.page_subtitle || 'বিষয় ও অধ্যায় ধরে ফিল্টার করো'}
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
            {cms.page_title || 'ক্লাস আর্কাইভ'}
          </h1>
          <p className="text-base mb-8" style={{ color: '#94A3B8' }}>
            {cms.page_description || 'প্রতিদিনের ক্লাস রেকর্ডিং'} — {cms.page_subtitle || 'বিষয় ও অধ্যায় ধরে ফিল্টার করো, যখন খুশি দেখো।'}
          </p>

          <ClassesFilter classes={classes} chapterNames={chapterNames} />

          <div
            className="rounded-[14px] p-8 text-center mt-8"
            style={{ background: '#F0FDFA' }}
          >
            <div className="text-3xl mb-3">📹</div>
            <p className="text-base font-medium mb-2" style={{ color: '#134E4A' }}>
              {cms.info_text || 'প্রতিদিন নতুন ক্লাস যোগ হচ্ছে'}
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
