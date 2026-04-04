import type { Metadata } from 'next';
import ClassesFilter from '@/components/classes/ClassesFilter';

export const metadata: Metadata = {
  title: 'ক্লাস আর্কাইভ — সূত্র | suttro.app',
};

export default function ClassesPage() {
  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
          ক্লাস আর্কাইভ
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--suttro-muted)' }}>
          প্রতিদিনের ক্লাস রেকর্ডিং — বিষয় ও অধ্যায় ধরে ফিল্টার করো, যখন খুশি দেখো।
        </p>

        <ClassesFilter />

        {/* Info note */}
        <div
          className="rounded-[14px] p-8 text-center mt-8"
          style={{ background: 'var(--suttro-sky)' }}
        >
          <div className="text-3xl mb-3">📹</div>
          <p className="text-base font-medium mb-2" style={{ color: 'var(--suttro-deep)' }}>
            প্রতিদিন নতুন ক্লাস যোগ হচ্ছে
          </p>
          <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
            ৬টি বিষয়ে ১৩টি ক্লাস রেকর্ডিং এখন দেখার জন্য প্রস্তুত।
            প্রতিটি ক্লাসের সাথে ইন্টারেক্টিভ সিমুলেশন লিঙ্ক করা আছে।
          </p>
        </div>
      </div>
    </div>
  );
}
