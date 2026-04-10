import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'গোপনীয়তা নীতি | সূত্র',
  description: 'সূত্র অ্যাপের গোপনীয়তা নীতি — আমরা কীভাবে তোমার তথ্য সংরক্ষণ ও ব্যবহার করি',
};

export default function PrivacyPage() {
  return (
    <div className="flex-1 pb-24 lg:pb-0" style={{ background: '#FAFBFC' }}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: '#134E4A' }}
        >
          গোপনীয়তা নীতি
        </h1>
        <p className="text-sm mb-8" style={{ color: '#94A3B8' }}>
          সর্বশেষ আপডেট: ১১ এপ্রিল, ২০২৬
        </p>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#334155' }}>
          <Section title="১. ভূমিকা">
            <p>
              সূত্র (suttro.app) একটি শিক্ষামূলক প্ল্যাটফর্ম যা NCTB পাঠ্যক্রম
              অনুসারে ক্লাস ৯-১০ এর শিক্ষার্থীদের জন্য ইন্টারেক্টিভ সায়েন্স
              সিমুলেশন, ভিডিও ক্লাস, MCQ পরীক্ষা এবং অন্যান্য শিক্ষা উপকরণ
              সরবরাহ করে। এই গোপনীয়তা নীতি ব্যাখ্যা করে আমরা কীভাবে তোমার তথ্য
              সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি।
            </p>
          </Section>

          <Section title="২. আমরা যা সংগ্রহ করি">
            <p className="font-medium mb-2">অ্যাকাউন্ট তথ্য:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>ফোন নম্বর (ফোন দিয়ে লগইন করলে)</li>
              <li>নাম ও ইমেইল (Google দিয়ে লগইন করলে)</li>
              <li>প্রোফাইল ছবি (Google অ্যাকাউন্ট থেকে)</li>
              <li>ক্লাস লেভেল (৯ বা ১০)</li>
            </ul>
            <p className="font-medium mb-2">ব্যবহারের তথ্য:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>পরীক্ষার ফলাফল ও স্কোর</li>
              <li>সিমুলেশন ও ভিডিও ক্লাস ব্যবহারের তথ্য</li>
              <li>অ্যাপ ব্যবহারের সময় ও ফ্রিকোয়েন্সি</li>
            </ul>
            <p className="font-medium mb-2">ডিভাইস তথ্য:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>ডিভাইস মডেল ও অপারেটিং সিস্টেম</li>
              <li>ব্রাউজার বা অ্যাপ ভার্সন</li>
              <li>IP ঠিকানা</li>
            </ul>
          </Section>

          <Section title="৩. তথ্য ব্যবহারের উদ্দেশ্য">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>তোমার অ্যাকাউন্ট পরিচালনা ও নিরাপত্তা</li>
              <li>ব্যক্তিগতকৃত শিক্ষা অভিজ্ঞতা প্রদান</li>
              <li>পড়াশোনার অগ্রগতি ট্র্যাক করা</li>
              <li>অ্যাপ উন্নয়ন ও বাগ সমাধান</li>
              <li>গুরুত্বপূর্ণ আপডেট সম্পর্কে জানানো</li>
            </ul>
          </Section>

          <Section title="৪. তৃতীয় পক্ষের সেবা">
            <p className="mb-2">
              আমরা নিম্নলিখিত তৃতীয় পক্ষের সেবা ব্যবহার করি:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Supabase</strong> — ডেটাবেস ও ব্যবহারকারী যাচাইকরণ
              </li>
              <li>
                <strong>Google</strong> — লগইন যাচাইকরণ (Google Sign-In)
              </li>
              <li>
                <strong>YouTube</strong> — ভিডিও ক্লাস হোস্টিং
              </li>
            </ul>
            <p className="mt-2">
              এই সেবাগুলোর নিজস্ব গোপনীয়তা নীতি রয়েছে। আমরা শুধুমাত্র
              প্রয়োজনীয় তথ্যই এদের সাথে শেয়ার করি।
            </p>
          </Section>

          <Section title="৫. তথ্য সুরক্ষা">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>সকল ডেটা HTTPS এনক্রিপশনের মাধ্যমে আদান-প্রদান হয়</li>
              <li>পাসওয়ার্ড হ্যাশ করে সংরক্ষণ করা হয়</li>
              <li>নিয়মিত নিরাপত্তা পর্যালোচনা করা হয়</li>
              <li>অনুমোদিত কর্মীরাই শুধু ডেটা অ্যাক্সেস করতে পারে</li>
            </ul>
          </Section>

          <Section title="৬. শিশুদের গোপনীয়তা">
            <p>
              সূত্র ক্লাস ৯-১০ এর শিক্ষার্থীদের জন্য (সাধারণত ১৪-১৬ বছর বয়সী)।
              আমরা শুধুমাত্র শিক্ষামূলক সেবা প্রদানের জন্য ন্যূনতম প্রয়োজনীয়
              তথ্য সংগ্রহ করি। আমরা কোনো শিশুর তথ্য বিজ্ঞাপন বা বিপণনের
              উদ্দেশ্যে ব্যবহার করি না।
            </p>
          </Section>

          <Section title="৭. তোমার অধিকার">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>তোমার সংরক্ষিত তথ্য দেখার অধিকার</li>
              <li>তথ্য সংশোধন বা আপডেট করার অধিকার</li>
              <li>অ্যাকাউন্ট মুছে ফেলার অনুরোধ করার অধিকার</li>
              <li>ডেটা প্রসেসিংয়ে আপত্তি করার অধিকার</li>
            </ul>
          </Section>

          <Section title="৮. ডেটা সংরক্ষণ">
            <p>
              তোমার অ্যাকাউন্ট সক্রিয় থাকা পর্যন্ত আমরা তোমার তথ্য সংরক্ষণ
              করি। অ্যাকাউন্ট মুছে ফেলার অনুরোধ করলে, ৩০ দিনের মধ্যে সকল
              ব্যক্তিগত তথ্য মুছে ফেলা হবে।
            </p>
          </Section>

          <Section title="৯. কুকি ও লোকাল স্টোরেজ">
            <p>
              আমরা তোমার লগইন সেশন বজায় রাখতে এবং অ্যাপ সেটিংস সংরক্ষণ করতে
              কুকি ও লোকাল স্টোরেজ ব্যবহার করি। এগুলো তোমার অভিজ্ঞতা উন্নত
              করতে সাহায্য করে।
            </p>
          </Section>

          <Section title="১০. পরিবর্তন">
            <p>
              এই গোপনীয়তা নীতি পরিবর্তন হলে আমরা অ্যাপে বিজ্ঞপ্তির মাধ্যমে
              জানাবো। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে তোমার সম্মতি নেওয়া হবে।
            </p>
          </Section>

          <Section title="১১. যোগাযোগ">
            <p>
              গোপনীয়তা সম্পর্কিত যেকোনো প্রশ্ন বা অনুরোধের জন্য যোগাযোগ করো:
            </p>
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
            Privacy Policy (English Summary)
          </h2>
          <div className="space-y-2 text-sm" style={{ color: '#64748B' }}>
            <p>
              Suttro (suttro.app) is an educational platform for SSC students in
              Bangladesh. We collect minimal personal information (phone number
              or Google account details) required to provide our educational
              services.
            </p>
            <p>
              We use Supabase for authentication and data storage, and Google
              Sign-In for social login. All data is transmitted over HTTPS. We do
              not sell or share your personal data with third parties for
              advertising purposes.
            </p>
            <p>
              Users can request account deletion by contacting us at
              contact@suttro.app. Upon request, all personal data will be deleted
              within 30 days.
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
