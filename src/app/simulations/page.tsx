import type { Metadata } from 'next';
import { simulations } from '@/simulations/registry';
import { getSiteContent } from '@/lib/site-content';
import SimulationsFilter from '@/components/simulations/SimulationsFilter';

export const metadata: Metadata = {
  title: 'সিমুলেশন - Suttro | suttro.app',
  description: 'NCTB ক্লাস ৯-১০ ইন্টারেক্টিভ সিমুলেশন। পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, সাধারণ গণিত, উচ্চতর গণিত, ইংরেজি।',
};

// Serialize for client component (strip non-serializable component field)
const simEntries = simulations.map((s) => ({
  slug: s.slug,
  config: s.config,
}));

// Subject counts for hero stats
const subjectStats = simulations.reduce((acc, s) => {
  acc[s.config.subject] = (acc[s.config.subject] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

export const revalidate = 60;

export default async function SimulationsPage() {
  const cms = await getSiteContent('simulations');
  const totalSubjects = Object.keys(subjectStats).length;

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      {/* ── Hero banner - teal gradient, suttro branding ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--suttro-primary-text) 0%, var(--suttro-primary) 60%, var(--suttro-primary-light) 100%)',
        }}
      >
        {/* Dot grid texture overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.6) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Amber accent glow */}
        <div
          aria-hidden
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(245,158,11,0.25), transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 lg:px-6 py-8 lg:py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.95)',
              fontSize: '13px',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--suttro-amber)' }} />
            NCTB ক্লাস ৯-১০
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold mb-3 text-white leading-tight">
            {cms.page_title || 'সিমুলেশন লাইব্রেরি'}
          </h1>
          <p className="text-sm lg:text-lg max-w-2xl" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {cms.page_subtitle || 'বিজ্ঞান দেখো, বিজ্ঞান বোঝো। ইন্টারেক্টিভ সিমুলেশনে নিজে চালিয়ে শেখো - বই পড়ার মতো নয়, বরং পরীক্ষাগারে থাকার মতো।'}
          </p>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            <div
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              {simulations.length}টি সিমুলেশন
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              {totalSubjects}টি বিষয়
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'var(--suttro-amber)', color: 'var(--suttro-amber-text)' }}
            >
              সম্পূর্ণ ফ্রি
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter + grid ── */}
      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-6 lg:py-10 pb-24 lg:pb-12">
        <SimulationsFilter simulations={simEntries} />

        {/* Footer info */}
        <div
          className="mt-10 rounded-[14px] border p-6 lg:p-8 text-center"
          style={{
            borderColor: 'var(--suttro-primary-border)',
            background: 'var(--suttro-primary-bg)',
          }}
        >
          <div className="text-2xl mb-2">🧪</div>
          <p className="text-base lg:text-lg font-semibold mb-1" style={{ color: 'var(--suttro-primary-text)' }}>
            {cms.info_text || `${totalSubjects}টি বিষয়ে ${simulations.length}টি সিমুলেশন প্রস্তুত`}
          </p>
          <p className="text-sm lg:text-base" style={{ color: 'var(--suttro-primary-text)', opacity: 0.75 }}>
            প্রতিটি সিমুলেশন NCTB পাঠ্যবইয়ের অধ্যায়ের সাথে সরাসরি যুক্ত। আরও নতুন সিমুলেশন শীঘ্রই আসছে।
          </p>
        </div>
      </div>
    </div>
  );
}
