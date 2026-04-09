import Link from 'next/link';
import { simulations } from '@/simulations/registry';
import SimulationCard from '@/components/ui/SimulationCard';
import HeroSimulation from '@/components/home/HeroSimulation';
import { getClasses, getExams } from '@/lib/data';
import { SUBJECT_COLORS, SUBJECT_LABELS, SUBJECT_ICONS, ytThumb } from '@/lib/constants';

export const revalidate = 300;

// ─────────────────────────────────────────────
// Homepage — সূত্র | suttro.app
// Hero with LIVE simulation (not static image)
// Stats, features, gallery preview, CTA
// ─────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🔬',
    title: 'ইন্টারেক্টিভ সিমুলেশন',
    desc: 'স্লাইডার টানো, ভ্যারিয়েবল বদলাও — দেখো বিজ্ঞান কীভাবে কাজ করে।',
  },
  {
    icon: '📹',
    title: 'ভিডিও ক্লাস',
    desc: '১০ বছরের অভিজ্ঞ শিক্ষকের ক্লাস — যখন খুশি দেখো, বারবার দেখো।',
  },
  {
    icon: '📝',
    title: 'MCQ অনুশীলন',
    desc: '৮৪০+ MCQ প্রশ্ন — অধ্যায়ভিত্তিক অনুশীলন ও পূর্ণাঙ্গ পরীক্ষা।',
  },
  {
    icon: '🧠',
    title: 'স্পেসড রিপিটিশন',
    desc: 'ভুল উত্তর অটো-রিভিউ ডেকে যোগ হয় — বৈজ্ঞানিক পদ্ধতিতে মনে রাখো।',
  },
];

const STATS = [
  { value: '13', label: 'সিমুলেশন' },
  { value: '840+', label: 'MCQ প্রশ্ন' },
  { value: '28', label: 'পরীক্ষা' },
  { value: '18', label: 'ব্যাজ' },
];

export default async function Home() {
  const [CLASSES, EXAMS] = await Promise.all([getClasses(), getExams()]);
  const EXAM_SUBJECT_COLORS = SUBJECT_COLORS;
  const EXAM_SUBJECT_ICONS = SUBJECT_ICONS;
  return (
    <div className="flex flex-col">
      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--suttro-deep)' }}
      >
        <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-[2.75rem] lg:text-5xl font-bold text-white leading-[1.15] mb-5">
              বিজ্ঞান দেখো, বিজ্ঞান বোঝো।
            </h1>
            <p className="text-lg lg:text-xl text-white/60 max-w-xl mx-auto mb-8">
              ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স সিমুলেশন — NCTB পাঠ্যবইয়ের প্রতিটি অধ্যায়,
              এখন তোমার হাতের মুঠোয়।
            </p>
            <div className="flex flex-col lg:flex-row gap-3 justify-center">
              <Link
                href="/simulations"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[12px] text-lg font-semibold text-white suttro-transition hover:opacity-90"
                style={{ background: 'var(--suttro-primary)' }}
              >
                সিমুলেশন চালাও &rarr;
              </Link>
              <Link
                href="/classes"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[12px] text-lg font-semibold suttro-transition hover:bg-white/15"
                style={{ color: 'white', border: '1.5px solid rgba(255,255,255,0.25)' }}
              >
                &#9654; ক্লাস দেখো
              </Link>
            </div>
          </div>

          {/* Live simulation in hero */}
          <div className="max-w-4xl mx-auto">
            <HeroSimulation />
            <p className="text-center text-sm text-white/30 mt-3">
              এটাই সূত্র — নিজে চালিয়ে দেখো &#9757;
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: 'var(--suttro-sky)' }}>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-3xl lg:text-4xl font-bold"
                  style={{ color: 'var(--suttro-primary)' }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-base mt-1"
                  style={{ color: 'var(--suttro-muted)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ background: 'var(--suttro-surface)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2
            className="text-3xl lg:text-4xl font-bold text-center mb-10"
            style={{ color: 'var(--suttro-deep)' }}
          >
            কেন সূত্র?
          </h2>
          <div className="grid lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[14px] border p-6"
                style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--suttro-deep)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--suttro-muted)' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gamification / Learning Features ── */}
      <section style={{ background: 'var(--suttro-white)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2
            className="text-3xl lg:text-4xl font-bold text-center mb-3"
            style={{ color: 'var(--suttro-deep)' }}
          >
            শেখো, খেলো, জিতো
          </h2>
          <p className="text-base text-center mb-10" style={{ color: 'var(--suttro-muted)' }}>
            XP অর্জন করো, স্ট্রিক ধরে রাখো, ব্যাজ সংগ্রহ করো — প্রতিদিন।
          </p>
          <div className="grid lg:grid-cols-3 gap-6">
            <Link href="/daily"
              className="rounded-[14px] border p-6 suttro-transition hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-surface)' }}>
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--suttro-deep)' }}>
                দৈনিক চ্যালেঞ্জ
              </h3>
              <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
                প্রতিদিন ৫টি নতুন প্রশ্ন — সব সঠিক হলে বোনাস XP!
              </p>
            </Link>
            <Link href="/achievements"
              className="rounded-[14px] border p-6 suttro-transition hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-surface)' }}>
              <div className="text-4xl mb-3">🎖️</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--suttro-deep)' }}>
                ব্যাজ ও অ্যাচিভমেন্ট
              </h3>
              <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
                ১৮টি ব্যাজ — পরীক্ষা দাও, স্ট্রিক রাখো, মাস্টার হও।
              </p>
            </Link>
            <Link href="/leaderboard"
              className="rounded-[14px] border p-6 suttro-transition hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-surface)' }}>
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--suttro-deep)' }}>
                লিডারবোর্ড
              </h3>
              <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
                সাপ্তাহিক ও সর্বকালীন — তোমার র‍্যাংকিং দেখো।
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Simulation Gallery Preview ── */}
      <section style={{ background: 'var(--suttro-white)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-3xl lg:text-4xl font-bold"
              style={{ color: 'var(--suttro-deep)' }}
            >
              সিমুলেশন
            </h2>
            <Link
              href="/simulations"
              className="text-base font-medium suttro-transition hover:opacity-80"
              style={{ color: 'var(--suttro-primary)' }}
            >
              সব দেখো &rarr;
            </Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {simulations.map((sim) => (
              <SimulationCard key={sim.slug} config={sim.config} slug={sim.slug} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Classes ── */}
      <section style={{ background: 'var(--suttro-surface)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-3xl lg:text-4xl font-bold"
              style={{ color: 'var(--suttro-deep)' }}
            >
              সাম্প্রতিক ক্লাস
            </h2>
            <Link
              href="/classes"
              className="text-base font-medium suttro-transition hover:opacity-80"
              style={{ color: 'var(--suttro-primary)' }}
            >
              সব ক্লাস &rarr;
            </Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            {CLASSES.slice(0, 6).map((cls) => (
              <Link
                key={cls.slug}
                href={`/class/${cls.slug}`}
                className="group rounded-[14px] border overflow-hidden suttro-transition hover:shadow-lg"
                style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
              >
                {/* Thumbnail */}
                <div
                  className="h-40 relative overflow-hidden"
                  style={{ background: 'var(--player-bg)' }}
                >
                  {cls.youtubeId ? (
                    <img
                      src={ytThumb(cls.youtubeId, 'hq')}
                      alt={cls.title}
                      className="w-full h-full object-cover group-hover:scale-105 suttro-transition"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: SUBJECT_COLORS[cls.subject] + '12' }}
                    >
                      <span className="text-5xl opacity-60">{SUBJECT_ICONS[cls.subject]}</span>
                    </div>
                  )}
                  {/* Subject badge */}
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded text-sm font-medium text-white"
                    style={{ background: SUBJECT_COLORS[cls.subject] }}
                  >
                    {SUBJECT_LABELS[cls.subject]}
                  </div>
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 suttro-transition">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-lg"
                      style={{ background: 'var(--suttro-primary)' }}
                    >
                      ▶
                    </div>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-sm font-medium text-white bg-black/70">
                    {cls.duration}
                  </div>
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3
                    className="text-lg font-semibold mb-1 truncate group-hover:text-[var(--suttro-primary)] suttro-transition"
                    style={{ color: 'var(--suttro-deep)' }}
                  >
                    {cls.title}
                  </h3>
                  <div
                    className="flex items-center gap-2 text-base"
                    style={{ color: 'var(--suttro-muted)' }}
                  >
                    <span>অধ্যায় {cls.chapter}</span>
                    <span>·</span>
                    <span>{cls.duration}</span>
                    <span>·</span>
                    <span>ক্লাস {cls.classLevel}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MCQ Exams ── */}
      <section style={{ background: 'var(--suttro-white)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-3xl lg:text-4xl font-bold"
              style={{ color: 'var(--suttro-deep)' }}
            >
              MCQ পরীক্ষা
            </h2>
            <Link
              href="/exams"
              className="text-base font-medium suttro-transition hover:opacity-80"
              style={{ color: 'var(--suttro-primary)' }}
            >
              সব পরীক্ষা &rarr;
            </Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            {EXAMS.slice(0, 3).map((exam) => {
              const color = EXAM_SUBJECT_COLORS[exam.subject] || '#1B6B4A';
              return (
                <Link
                  key={exam.id}
                  href={`/exam/${exam.id}`}
                  className="group rounded-[14px] border overflow-hidden suttro-transition hover:shadow-lg"
                  style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-surface)' }}
                >
                  <div className="h-2" style={{ background: color }} />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{EXAM_SUBJECT_ICONS[exam.subject]}</span>
                      <span className="px-2.5 py-1 rounded text-sm font-medium text-white" style={{ background: color }}>
                        {exam.subjectBn}
                      </span>
                    </div>
                    <h3
                      className="text-lg font-semibold mb-2 group-hover:text-[var(--suttro-primary)] suttro-transition"
                      style={{ color: 'var(--suttro-deep)' }}
                    >
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-3 text-base" style={{ color: 'var(--suttro-muted)' }}>
                      <span>{exam.questionCount} প্রশ্ন</span>
                      <span>·</span>
                      <span>{exam.duration} মিনিট</span>
                      <span>·</span>
                      <span>{exam.totalMarks} নম্বর</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Trust / Teacher Section ── */}
      <section style={{ background: 'var(--suttro-sky)' }}>
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-xl font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            ১০ বছরের অভিজ্ঞতা, এক ক্লিকে।
          </p>
          <p className="text-base leading-relaxed" style={{ color: 'var(--suttro-muted)' }}>
            সূত্র তৈরি করেছে একজন অভিজ্ঞ বিজ্ঞান শিক্ষক — যিনি জানেন ঠিক কোথায় শিক্ষার্থীরা আটকে যায়,
            আর কীভাবে interactive simulation দিয়ে সেই গ্যাপ পূরণ করা যায়।
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--suttro-deep)' }}>
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            আজই শুরু করো
          </h2>
          <p className="text-lg text-white/60 mb-8">
            সিমুলেশন, ক্লাস, MCQ সব ফ্রি — লগ ইন করে অগ্রগতি ট্র্যাক করো।
          </p>
          <div className="flex flex-col lg:flex-row gap-3 justify-center">
            <Link
              href="/guide"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[12px] text-lg font-semibold suttro-transition hover:opacity-90"
              style={{ background: 'var(--suttro-accent)', color: 'var(--suttro-deep)' }}
            >
              গাইড দেখো &rarr;
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[12px] text-lg font-semibold suttro-transition hover:bg-white/15"
              style={{ color: 'white', border: '1.5px solid rgba(255,255,255,0.25)' }}
            >
              লগ ইন করো
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
