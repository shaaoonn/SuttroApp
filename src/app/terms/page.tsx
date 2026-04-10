import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ব্যবহারের শর্তাবলী | সূত্র',
  description: 'সূত্র অ্যাপ ব্যবহারের শর্তাবলী',
};

export default function TermsPage() {
  return (
    <div className="flex-1 pb-24 lg:pb-0" style={{ background: '#FAFBFC' }}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: '#134E4A' }}
        >
          ব্যবহারের শর্তাবলী
        </h1>
        <p className="text-sm mb-8" style={{ color: '#94A3B8' }}>
          সর্বশেষ আপডেট: ১১ এপ্রিল, ২০২৬
        </p>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#334155' }}>
          <Section title="১. সেবার বিবরণ">
            <p>
              সূত্র (suttro.app) NCTB পাঠ্যক্রম অনুসারে ক্লাস ৯-১০ এর
              শিক্ষার্থীদের জন্য একটি শিক্ষামূলক প্ল্যাটফর্ম। আমরা ইন্টারেক্টিভ
              সায়েন্স সিমুলেশন, ভিডিও ক্লাস, MCQ পরীক্ষা, সৃজনশীল প্রশ্ন এবং
              পড়াশোনার গাইড সরবরাহ করি।
            </p>
          </Section>

          <Section title="২. অ্যাকাউন্ট">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>অ্যাকাউন্ট তৈরি করতে ফোন নম্বর বা Google অ্যাকাউন্ট প্রয়োজন</li>
              <li>সঠিক তথ্য প্রদান করা বাধ্যতামূলক</li>
              <li>তোমার অ্যাকাউন্টের নিরাপত্তা তোমার দায়িত্ব</li>
              <li>অন্যের অ্যাকাউন্ট ব্যবহার করা নিষিদ্ধ</li>
            </ul>
          </Section>

          <Section title="৩. গ্রহণযোগ্য ব্যবহার">
            <p className="mb-2">তুমি এই প্ল্যাটফর্ম ব্যবহার করতে পারবে:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>নিজের শিক্ষামূলক উদ্দেশ্যে</li>
              <li>আমাদের নিয়ম মেনে</li>
            </ul>
            <p className="mb-2">যা করা যাবে না:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>কন্টেন্ট কপি বা পুনঃবিতরণ করা</li>
              <li>প্ল্যাটফর্মের ক্ষতি করার চেষ্টা করা</li>
              <li>অন্য ব্যবহারকারীদের বিরক্ত করা</li>
              <li>ভুয়া তথ্য দিয়ে অ্যাকাউন্ট তৈরি করা</li>
              <li>বাণিজ্যিক উদ্দেশ্যে কন্টেন্ট ব্যবহার করা</li>
            </ul>
          </Section>

          <Section title="৪. কন্টেন্ট ও মেধাসত্ত্ব">
            <p>
              সূত্র-তে প্রকাশিত সকল কন্টেন্ট (সিমুলেশন, ভিডিও, প্রশ্ন,
              ডিজাইন) সূত্র-এর সম্পত্তি। অনুমতি ছাড়া কোনো কন্টেন্ট কপি,
              পরিবর্তন বা পুনঃবিতরণ করা যাবে না।
            </p>
          </Section>

          <Section title="৫. সেবার পরিবর্তন">
            <p>
              আমরা যেকোনো সময় সেবার বৈশিষ্ট্য পরিবর্তন, আপডেট বা বন্ধ করতে
              পারি। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে আমরা ব্যবহারকারীদের আগে
              থেকে জানাবো।
            </p>
          </Section>

          <Section title="৬. অ্যাকাউন্ট বাতিল">
            <p>
              নিয়ম লঙ্ঘন করলে আমরা অ্যাকাউন্ট সাময়িক বা স্থায়ীভাবে বন্ধ করতে
              পারি। তুমিও যেকোনো সময় তোমার অ্যাকাউন্ট মুছে ফেলার অনুরোধ করতে
              পারো।
            </p>
          </Section>

          <Section title="৭. দায়সীমা">
            <p>
              সূত্র একটি শিক্ষামূলক সহায়ক প্ল্যাটফর্ম। আমরা পরীক্ষার ফলাফল বা
              একাডেমিক সাফল্যের নিশ্চয়তা দিই না। প্ল্যাটফর্ম ব্যবহারের
              ফলাফলের জন্য আমরা দায়ী নই।
            </p>
          </Section>

          <Section title="৮. যোগাযোগ">
            <p>শর্তাবলী সম্পর্কে প্রশ্ন থাকলে যোগাযোগ করো:</p>
            <div
              className="mt-3 rounded-xl p-4"
              style={{ background: '#F0FDFA', border: '1px solid #CCFBF1' }}
            >
              <p className="font-medium" style={{ color: '#134E4A' }}>
                সূত্র (Suttro)
              </p>
              <p className="mt-1">ইমেইল: contact@suttro.app</p>
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
            Terms of Service (English Summary)
          </h2>
          <div className="space-y-2 text-sm" style={{ color: '#64748B' }}>
            <p>
              Suttro is an educational platform for SSC students. By using our
              service, you agree to use it only for personal educational
              purposes. You must not copy, redistribute, or commercially use any
              content. We reserve the right to modify our services and terminate
              accounts that violate these terms.
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
