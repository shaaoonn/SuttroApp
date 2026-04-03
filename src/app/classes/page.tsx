import type { Metadata } from 'next';

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
        <p className="text-sm mb-10" style={{ color: 'var(--suttro-muted)' }}>
          প্রতিদিনের ক্লাস রেকর্ডিং — যখন খুশি দেখো, বারবার দেখো।
        </p>

        {/* Placeholder */}
        <div
          className="rounded-[14px] border p-12 text-center"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          <div className="text-4xl mb-4">📹</div>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--suttro-deep)' }}>
            শীঘ্রই আসছে
          </p>
          <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
            ডেইলি ক্লাস রেকর্ডিং আর্কাইভ তৈরি হচ্ছে। HLS ভিডিও স্ট্রিমিং সহ
            সব ক্লাস এখানে পাওয়া যাবে।
          </p>
        </div>
      </div>
    </div>
  );
}
