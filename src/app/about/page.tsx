import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteContent } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে - সূত্র | suttro.app',
};

export const revalidate = 60;

export default async function AboutPage() {
  const c = await getSiteContent('about');

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--suttro-deep)' }}>
          {c.page_title || 'আমাদের সম্পর্কে'}
        </h1>

        {/* Mission */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            {c.mission_title || 'আমাদের মিশন'}
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--suttro-text)' }}>
            {c.mission_text || 'সূত্র বাংলাদেশের শিক্ষার্থীদের জন্য বিজ্ঞানকে স্পর্শযোগ্য করে তোলে।'}
          </p>
        </section>

        {/* Teacher story */}
        <section
          className="rounded-[14px] border p-6 md:p-8 mb-10"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            {c.experience_title || '১০ বছরের অভিজ্ঞতা'}
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--suttro-text)' }}>
            {c.experience_text1 || ''}
          </p>
          <p className="text-base leading-relaxed" style={{ color: 'var(--suttro-text)' }}>
            {c.experience_text2 || ''}
          </p>
        </section>

        {/* EJOSB IT */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            {c.company_title || 'EJOSB IT'}
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--suttro-text)' }}>
            {c.company_text || ''}
          </p>
        </section>

        {/* Vision */}
        <section
          className="rounded-[14px] p-6 md:p-8 text-center"
          style={{ background: 'var(--suttro-sky)' }}
        >
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--suttro-deep)' }}>
            {c.vision_title || 'বিজ্ঞান পড়া নয়, বিজ্ঞান করা।'}
          </p>
          <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            {c.vision_text || ''}
          </p>
          <Link
            href="/simulations"
            className="inline-flex items-center mt-4 px-6 py-3 rounded-[10px] text-base font-medium text-white suttro-transition"
            style={{ background: 'var(--suttro-primary)' }}
          >
            {c.vision_cta || 'সিমুলেশন দেখো'} &rarr;
          </Link>
        </section>
      </div>
    </div>
  );
}
