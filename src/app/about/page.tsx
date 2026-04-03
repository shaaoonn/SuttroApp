import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে — সূত্র | suttro.app',
};

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--suttro-deep)' }}>
          আমাদের সম্পর্কে
        </h1>

        {/* Mission */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            আমাদের মিশন
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--suttro-text)' }}>
            সূত্র বাংলাদেশের শিক্ষার্থীদের জন্য বিজ্ঞানকে স্পর্শযোগ্য করে তোলে — বইয়ের স্থির ছবিকে
            ইন্টারেক্টিভ সিমুলেশনে রূপান্তরিত করে। প্রতিটি বাংলাদেশী শিক্ষার্থী যেন ল্যাব ছাড়াই
            ল্যাবের অভিজ্ঞতা পায়।
          </p>
        </section>

        {/* Teacher story */}
        <section
          className="rounded-[14px] border p-6 sm:p-8 mb-10"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            ১০ বছরের অভিজ্ঞতা
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--suttro-text)' }}>
            সূত্র-র পেছনে আছে একজন অভিজ্ঞ বিজ্ঞান শিক্ষকের ১০ বছরের পড়ানোর অভিজ্ঞতা।
            হাজার হাজার শিক্ষার্থীদের পড়িয়ে তিনি জানেন — ঠিক কোথায় শিক্ষার্থীরা আটকে যায়,
            কোন concept-গুলো শুধু বই পড়ে বোঝা যায় না।
          </p>
          <p className="text-base leading-relaxed" style={{ color: 'var(--suttro-text)' }}>
            সেই অভিজ্ঞতা থেকেই তৈরি হয়েছে প্রতিটি সিমুলেশন — যাতে শিক্ষার্থীরা নিজে হাত দিয়ে
            ভ্যারিয়েবল বদলে দেখতে পারে বিজ্ঞান কীভাবে কাজ করে।
          </p>
        </section>

        {/* EJOSB IT */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            EJOSB IT
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--suttro-text)' }}>
            সূত্র তৈরি করেছে EJOSB IT — বাংলাদেশের একটি প্রযুক্তি প্রতিষ্ঠান যারা AI, automation,
            এবং ed-tech নিয়ে কাজ করে।
          </p>
        </section>

        {/* Vision */}
        <section
          className="rounded-[14px] p-6 sm:p-8 text-center"
          style={{ background: 'var(--suttro-sky)' }}
        >
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--suttro-deep)' }}>
            বিজ্ঞান পড়া নয়, বিজ্ঞান করা।
          </p>
          <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
            সূত্র-র ভিশন — বাংলাদেশের প্রতিটি শিক্ষার্থীর হাতে interactive science lab।
          </p>
          <Link
            href="/simulations"
            className="inline-flex items-center mt-4 px-6 py-2.5 rounded-[10px] text-sm font-medium text-white suttro-transition"
            style={{ background: 'var(--suttro-primary)' }}
          >
            সিমুলেশন দেখো &rarr;
          </Link>
        </section>
      </div>
    </div>
  );
}
