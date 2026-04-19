import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'রিফান্ড ও বাতিলকরণ নীতি | সূত্র',
  description: 'সূত্র অ্যাপের সাবস্ক্রিপশন বাতিলকরণ, অটো-রিনিউ বন্ধ, এবং রিফান্ড সংক্রান্ত নীতি',
};

export default function RefundPage() {
  return (
    <div className="flex-1 pb-24 lg:pb-0" style={{ background: '#FAFBFC' }}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: '#134E4A' }}
        >
          রিফান্ড ও বাতিলকরণ নীতি
        </h1>
        <p className="text-sm mb-8" style={{ color: '#94A3B8' }}>
          সর্বশেষ আপডেট: ১৯ এপ্রিল, ২০২৬
        </p>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#334155' }}>
          <Section title="১. পেমেন্ট ও সাবস্ক্রিপশন">
            <p>
              সূত্র (suttro.app)-এ প্রিমিয়াম প্ল্যান বিকাশ পেমেন্ট গেটওয়ের
              মাধ্যমে কেনা যায় (ওয়েব ব্রাউজার থেকে)। প্রতিটি পেমেন্টের পর
              তোমার অ্যাকাউন্টে নির্দিষ্ট মেয়াদের জন্য প্রিমিয়াম ফিচার সক্রিয়
              হয়ে যাবে।
            </p>
          </Section>

          <Section title="২. ফ্রি ট্রায়াল ও আগে টেস্ট করা">
            <p>
              সাবস্ক্রাইব করার আগে তুমি সূত্রের <strong>ফ্রি প্ল্যান</strong>{' '}
              ব্যবহার করে মূল ফিচারগুলো (সিমুলেশন, গাইড, কিছু পরীক্ষা) যাচাই
              করতে পারবে। প্রিমিয়াম প্ল্যান কেনার আগে দয়া করে ফ্রি প্ল্যানে
              সার্ভিস টেস্ট করে নাও।
            </p>
          </Section>

          <Section title="৩. অটো-রিনিউ ও বাতিলকরণ">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                প্রিমিয়াম প্ল্যান <strong>এককালীন (one-time)</strong> — মেয়াদ
                শেষ হলে স্বয়ংক্রিয়ভাবে নতুন করে কেটে নেওয়া হবে না।
              </li>
              <li>
                নিজে থেকে নতুন করে না কিনলে মেয়াদ শেষে তোমার অ্যাকাউন্ট
                স্বয়ংক্রিয়ভাবে ফ্রি প্ল্যানে নেমে আসবে।
              </li>
              <li>
                মেয়াদ চলাকালীন তুমি অ্যাপের ভেতর যেকোনো সময় পরবর্তী রিনিউ বন্ধ
                করে রাখতে পারো — কোনো অতিরিক্ত চার্জ হবে না।
              </li>
            </ul>
          </Section>

          <Section title="৪. রিফান্ড শর্ত">
            <p className="mb-2">
              ডিজিটাল পণ্য হওয়ায় সাধারণভাবে প্রিমিয়াম সাবস্ক্রিপশন ফেরতযোগ্য
              নয়। তবে নিচের পরিস্থিতিতে রিফান্ড করা হতে পারে:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>ভুল পেমেন্ট:</strong> একই প্ল্যানের জন্য দুইবার বা তার
                বেশি পেমেন্ট কাটা হলে — অতিরিক্ত পেমেন্ট ৭ কার্যদিবসের মধ্যে
                ফেরত দেওয়া হবে।
              </li>
              <li>
                <strong>প্রযুক্তিগত ত্রুটি:</strong> পেমেন্ট সফল হলেও তোমার
                অ্যাকাউন্টে প্রিমিয়াম ফিচার সক্রিয় না হলে — ৪৮ ঘণ্টার মধ্যে
                রিফান্ড বা সংশোধন।
              </li>
              <li>
                <strong>সেবা বন্ধ:</strong> সূত্র কোনো কারণে সেবা পুরোপুরি বন্ধ
                করলে সক্রিয় সাবস্ক্রিপশনের বাকি মেয়াদের আনুপাতিক অংশ ফেরত
                দেওয়া হবে।
              </li>
            </ul>
          </Section>

          <Section title="৫. রিফান্ডের প্রক্রিয়া">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                পেমেন্টের <strong>৭ দিনের</strong> মধ্যে{' '}
                <a
                  href="mailto:refund@suttro.app"
                  className="underline"
                  style={{ color: '#0D9488' }}
                >
                  refund@suttro.app
                </a>
                -এ ইমেইল পাঠাও।
              </li>
              <li>
                ইমেইলে <strong>বিকাশ ট্রানজ্যাকশন আইডি (TrxID)</strong>, তারিখ,
                এবং পরিমাণ উল্লেখ করো।
              </li>
              <li>
                আমরা ২ কার্যদিবসের মধ্যে অনুরোধ যাচাই করব এবং তোমাকে সিদ্ধান্ত
                জানিয়ে দেব।
              </li>
              <li>
                রিফান্ড অনুমোদিত হলে বিকাশ চ্যানেলে ৩–৭ কার্যদিবসের মধ্যে
                একই নম্বরে ফেরত পাঠানো হবে।
              </li>
            </ol>
          </Section>

          <Section title="৬. ডোনেশন">
            <p>
              সূত্র-কে প্রদান করা <strong>ডোনেশন অফেরতযোগ্য</strong>। ডোনেট
              করার আগে অনুগ্রহ করে পরিমাণ যাচাই করে নাও। ভুল অংকের ডোনেশন হলে
              পেমেন্টের ২৪ ঘণ্টার মধ্যে{' '}
              <a
                href="mailto:refund@suttro.app"
                className="underline"
                style={{ color: '#0D9488' }}
              >
                refund@suttro.app
              </a>
              -এ যোগাযোগ করো — আমরা পরিস্থিতি বিবেচনা করে সিদ্ধান্ত নেব।
            </p>
          </Section>

          <Section title="৭. যে কারণে রিফান্ড দেওয়া হবে না">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>প্রিমিয়াম ফিচার কেনার পর "ইচ্ছা বদলে গেছে" বলে আবেদন।</li>
              <li>কেনার পর ৭ দিন পার হলে।</li>
              <li>
                নিয়ম লঙ্ঘনের জন্য অ্যাকাউন্ট বাতিল (যেমন কন্টেন্ট শেয়ার,
                অ্যাকাউন্ট শেয়ার, হ্যাক প্রচেষ্টা)।
              </li>
              <li>ইন্টারনেট সংযোগ বা নিজের ডিভাইসের সমস্যা।</li>
            </ul>
          </Section>

          <Section title="৮. অ্যাকাউন্ট মুছে ফেলা">
            <p>
              যেকোনো সময় Settings → Account Deletion থেকে বা{' '}
              <a
                href="mailto:contact@suttro.app"
                className="underline"
                style={{ color: '#0D9488' }}
              >
                contact@suttro.app
              </a>
              -এ ইমেইল করে অ্যাকাউন্ট মুছে ফেলার অনুরোধ করতে পারো। সক্রিয়
              সাবস্ক্রিপশন থাকলে বাকি মেয়াদের জন্য আনুপাতিক রিফান্ডের আবেদন
              আলাদাভাবে করতে হবে।
            </p>
          </Section>

          <Section title="৯. যোগাযোগ">
            <p>রিফান্ড বা পেমেন্ট সংক্রান্ত যেকোনো প্রশ্নের জন্য:</p>
            <div
              className="mt-3 rounded-xl p-4"
              style={{ background: '#F0FDFA', border: '1px solid #CCFBF1' }}
            >
              <p className="font-medium" style={{ color: '#134E4A' }}>
                সূত্র (Suttro) — Billing & Refunds
              </p>
              <p className="mt-1">
                ইমেইল:{' '}
                <a
                  href="mailto:refund@suttro.app"
                  className="underline"
                  style={{ color: '#0D9488' }}
                >
                  refund@suttro.app
                </a>
              </p>
              <p>
                সাধারণ সহায়তা:{' '}
                <a
                  href="mailto:contact@suttro.app"
                  className="underline"
                  style={{ color: '#0D9488' }}
                >
                  contact@suttro.app
                </a>
              </p>
              <p>ওয়েবসাইট: https://suttro.app</p>
            </div>
          </Section>
        </div>

        {/* English Summary */}
        <div
          className="mt-10 rounded-xl p-5"
          style={{ background: 'white', border: '1px solid #E2E8F0' }}
        >
          <h2 className="text-base font-semibold mb-3" style={{ color: '#134E4A' }}>
            Refund &amp; Cancellation Policy (English Summary)
          </h2>
          <div className="space-y-2 text-sm" style={{ color: '#64748B' }}>
            <p>
              Suttro premium plans are one-time purchases with no auto-renewal.
              Digital subscriptions are non-refundable by default. However, we
              offer refunds for duplicate charges, technical failures where
              premium features do not activate, or service discontinuation.
              Refund requests must be submitted within 7 days of purchase to{' '}
              <a href="mailto:refund@suttro.app" className="underline">
                refund@suttro.app
              </a>{' '}
              with the bKash transaction ID. Donations are non-refundable.
              Account deletion is available at any time via Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold mb-2" style={{ color: '#134E4A' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
