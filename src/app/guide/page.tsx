import type { Metadata } from 'next';
import Link from 'next/link';
import { getGuide } from '@/lib/data';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'গাইড — বিষয়ভিত্তিক কন্টেন্ট — সূত্র | suttro.app',
  description: 'বিষয় ও অধ্যায় অনুযায়ী সব কন্টেন্ট — সিমুলেশন, ক্লাস, MCQ, সৃজনশীল — এক জায়গায়।',
};

export default async function GuidePage() {
  const GUIDE = await getGuide();

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            গাইড
          </h1>
          <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            বিষয় বেছে নাও — অধ্যায় অনুযায়ী সব কন্টেন্ট এক জায়গায়।
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GUIDE.map((g) => {
            const totalContent = g.totals.classes + g.totals.simulations + g.totals.mcq + g.totals.cq;
            return (
              <Link
                key={g.subject}
                href={`/guide/${g.subject}`}
                className="group block rounded-[14px] border overflow-hidden suttro-transition hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
              >
                <div className="h-2" style={{ background: g.color }} />
                <div className="p-5">
                  <div className="text-3xl mb-2">{g.icon}</div>
                  <h2 className="text-xl font-bold mb-1 group-hover:text-[var(--suttro-primary)] suttro-transition" style={{ color: 'var(--suttro-deep)' }}>
                    {g.subjectBn}
                  </h2>
                  <p className="text-sm mb-3" style={{ color: 'var(--suttro-muted)' }}>
                    {g.chapters.length} অধ্যায় · {totalContent} কন্টেন্ট
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {g.totals.simulations > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: `${g.color}12`, color: g.color }}>
                        🔬 {g.totals.simulations} সিমুলেশন
                      </span>
                    )}
                    {g.totals.classes > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: `${g.color}12`, color: g.color }}>
                        📹 {g.totals.classes} ক্লাস
                      </span>
                    )}
                    {g.totals.mcq > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: `${g.color}12`, color: g.color }}>
                        📝 {g.totals.mcq} MCQ
                      </span>
                    )}
                    {g.totals.cq > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: `${g.color}12`, color: g.color }}>
                        📖 {g.totals.cq} সৃজনশীল
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
