import type { Metadata } from 'next';
import { simulations } from '@/simulations/registry';
import SimulationsFilter from '@/components/simulations/SimulationsFilter';

export const metadata: Metadata = {
  title: 'সিমুলেশন — সূত্র | suttro.app',
  description: 'NCTB ক্লাস ৯-১০ ইন্টারেক্টিভ সিমুলেশন। পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, সাধারণ গণিত, উচ্চতর গণিত, ইংরেজি।',
};

// Serialize for client component (strip non-serializable component field)
const simEntries = simulations.map((s) => ({
  slug: s.slug,
  config: s.config,
}));

export default function SimulationsPage() {
  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            সিমুলেশন
          </h1>
          <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            NCTB ক্লাস ৯-১০ — বিষয় ও অধ্যায় ধরে ফিল্টার করো, সিমুলেশন চালাও।
          </p>
        </div>

        <SimulationsFilter simulations={simEntries} />

        {/* Info */}
        <div
          className="mt-12 rounded-[14px] border p-8 text-center"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          <p className="text-base font-medium mb-1" style={{ color: 'var(--suttro-deep)' }}>
            ৬টি বিষয়ে ১৩টি সিমুলেশন প্রস্তুত
          </p>
          <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
            প্রতিটি সিমুলেশন NCTB পাঠ্যবইয়ের অধ্যায়ের সাথে সরাসরি যুক্ত।
            আরও নতুন সিমুলেশন শীঘ্রই আসছে।
          </p>
        </div>
      </div>
    </div>
  );
}
