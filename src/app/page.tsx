import Link from 'next/link';
import { simulations } from '@/simulations/registry';
import SimulationCard from '@/components/ui/SimulationCard';

import MobileHome from '@/components/home/MobileHome';
import { getClasses, getExams } from '@/lib/data';
import { SUBJECT_COLORS, SUBJECT_LABELS, SUBJECT_ICONS, ytThumb } from '@/lib/constants';

export const revalidate = 300;

// ─────────────────────────────────────────────
// Homepage — সূত্র | suttro.app
// Mobile: App-style home (MobileHome component)
// Desktop: Full website with hero, features, gallery
// ─────────────────────────────────────────────

export default async function Home() {
  const [CLASSES, EXAMS] = await Promise.all([getClasses(), getExams()]);

  // Latest class for the mobile "new class" card
  const latestClass = CLASSES[0]
    ? { title: CLASSES[0].title, slug: CLASSES[0].slug, duration: CLASSES[0].duration }
    : null;

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════
          Mobile: App-style home
          ═══════════════════════════════════════ */}
      <div className="lg:hidden">
        <MobileHome latestClass={latestClass} />
      </div>

      {/* ═══════════════════════════════════════
          Desktop: Full website home
          ═══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:flex-col">
        {/* ── Hero Section ── */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #F0FDFA 0%, #F5F3FF 50%, #FEF3C7 100%)' }}
        >
          <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08), transparent 65%)' }} />
          <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20 relative z-10">
            <div className="text-center mb-8 lg:mb-10">
              <h1 className="text-[2.75rem] lg:text-5xl font-bold leading-[1.15] mb-5" style={{ color: '#134E4A' }}>
                বিজ্ঞান দেখো, বিজ্ঞান বোঝো।
              </h1>
              <p className="text-lg lg:text-xl max-w-xl mx-auto mb-8" style={{ color: '#5F9EA0' }}>
                ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স সিমুলেশন — NCTB পাঠ্যবইয়ের প্রতিটি অধ্যায়,
                এখন তোমার হাতের মুঠোয়।
              </p>
              <div className="flex flex-col lg:flex-row gap-3 justify-center">
                <Link
                  href="/simulations"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[12px] text-lg font-semibold text-white suttro-transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)', boxShadow: '0 4px 14px rgba(13,148,136,0.25)' }}
                >
                  সিমুলেশন চালাও &rarr;
                </Link>
                <Link
                  href="/classes"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[12px] text-lg font-semibold suttro-transition hover:bg-black/5"
                  style={{ color: '#0D9488', background: 'white', border: '1.5px solid #99F6E4' }}
                >
                  &#9654; ক্লাস দেখো
                </Link>
              </div>
            </div>
            <div className="max-w-4xl mx-auto">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: '#0F172A', aspectRatio: '16/9' }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Link
                    href="/simulations"
                    className="flex flex-col items-center gap-3 suttro-transition hover:scale-105"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl"
                      style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)' }}
                    >
                      🔬
                    </div>
                    <span className="text-white/80 text-sm font-medium">
                      সিমুলেশন চালাও &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section style={{ background: '#F0FDFA' }}>
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="grid grid-cols-4 gap-6 text-center">
              {[
                { value: '13', label: 'সিমুলেশন' },
                { value: '840+', label: 'MCQ প্রশ্ন' },
                { value: '28', label: 'পরীক্ষা' },
                { value: '18', label: 'ব্যাজ' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl lg:text-4xl font-bold" style={{ color: '#0D9488' }}>
                    {stat.value}
                  </div>
                  <div className="text-base mt-1" style={{ color: '#5F9EA0' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ background: '#F8FAFB' }}>
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-10" style={{ color: '#134E4A' }}>
              কেন সূত্র?
            </h2>
            <div className="grid lg:grid-cols-4 gap-6">
              {[
                { icon: '🔬', title: 'ইন্টারেক্টিভ সিমুলেশন', desc: 'স্লাইডার টানো, ভ্যারিয়েবল বদলাও — দেখো বিজ্ঞান কীভাবে কাজ করে।' },
                { icon: '📹', title: 'ভিডিও ক্লাস', desc: '১০ বছরের অভিজ্ঞ শিক্ষকের ক্লাস — যখন খুশি দেখো, বারবার দেখো।' },
                { icon: '📝', title: 'MCQ অনুশীলন', desc: '৮৪০+ MCQ প্রশ্ন — অধ্যায়ভিত্তিক অনুশীলন ও পূর্ণাঙ্গ পরীক্ষা।' },
                { icon: '🧠', title: 'স্পেসড রিপিটিশন', desc: 'ভুল উত্তর অটো-রিভিউ ডেকে যোগ হয় — বৈজ্ঞানিক পদ্ধতিতে মনে রাখো।' },
              ].map((feature) => (
                <div key={feature.title} className="rounded-[12px] border p-6" style={{ borderColor: '#F0F4F3', background: '#FFFFFF' }}>
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#134E4A' }}>{feature.title}</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#94A3B8' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Gamification ── */}
        <section style={{ background: '#FFFFFF' }}>
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-3" style={{ color: '#134E4A' }}>
              শেখো, খেলো, জিতো
            </h2>
            <p className="text-base text-center mb-10" style={{ color: '#94A3B8' }}>
              XP অর্জন করো, স্ট্রিক ধরে রাখো, ব্যাজ সংগ্রহ করো — প্রতিদিন।
            </p>
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { href: '/daily', icon: '📖', title: 'আজকের পড়া', desc: 'প্রতিদিনের ক্লাস, MCQ, বাড়ির কাজ — সব এক জায়গায়।' },
                { href: '/achievements', icon: '🎖️', title: 'ব্যাজ ও অ্যাচিভমেন্ট', desc: '১৮টি ব্যাজ — পরীক্ষা দাও, স্ট্রিক রাখো, মাস্টার হও।' },
                { href: '/leaderboard', icon: '🏆', title: 'লিডারবোর্ড', desc: 'সাপ্তাহিক ও সর্বকালীন — তোমার র‍্যাংকিং দেখো।' },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="rounded-[12px] border p-6 suttro-transition hover:shadow-lg hover:-translate-y-1"
                  style={{ borderColor: '#CCFBF1', background: '#FFFFFF' }}>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#134E4A' }}>{item.title}</h3>
                  <p className="text-base" style={{ color: '#94A3B8' }}>{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Simulations Gallery ── */}
        <section style={{ background: 'var(--suttro-white)' }}>
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: 'var(--suttro-deep)' }}>সিমুলেশন</h2>
              <Link href="/simulations" className="text-base font-medium suttro-transition hover:opacity-80" style={{ color: 'var(--suttro-primary)' }}>
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
              <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: 'var(--suttro-deep)' }}>সাম্প্রতিক ক্লাস</h2>
              <Link href="/classes" className="text-base font-medium suttro-transition hover:opacity-80" style={{ color: 'var(--suttro-primary)' }}>
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
                  <div className="h-40 relative overflow-hidden" style={{ background: 'var(--player-bg)' }}>
                    {cls.youtubeId ? (
                      <img
                        src={ytThumb(cls.youtubeId, 'hq')}
                        alt={cls.title}
                        className="w-full h-full object-cover group-hover:scale-105 suttro-transition"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: SUBJECT_COLORS[cls.subject] + '12' }}>
                        <span className="text-5xl opacity-60">{SUBJECT_ICONS[cls.subject]}</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded text-sm font-medium text-white" style={{ background: SUBJECT_COLORS[cls.subject] }}>
                      {SUBJECT_LABELS[cls.subject]}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 suttro-transition">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-lg" style={{ background: 'var(--suttro-primary)' }}>▶</div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-sm font-medium text-white bg-black/70">{cls.duration}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-1 truncate group-hover:text-[var(--suttro-primary)] suttro-transition" style={{ color: 'var(--suttro-deep)' }}>
                      {cls.title}
                    </h3>
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--suttro-muted)' }}>
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
              <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: 'var(--suttro-deep)' }}>MCQ পরীক্ষা</h2>
              <Link href="/exams" className="text-base font-medium suttro-transition hover:opacity-80" style={{ color: 'var(--suttro-primary)' }}>
                সব পরীক্ষা &rarr;
              </Link>
            </div>
            <div className="grid lg:grid-cols-3 gap-5">
              {EXAMS.slice(0, 3).map((exam) => {
                const color = SUBJECT_COLORS[exam.subject] || '#0D9488';
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
                        <span className="text-2xl">{SUBJECT_ICONS[exam.subject]}</span>
                        <span className="px-2.5 py-1 rounded text-sm font-medium text-white" style={{ background: color }}>{exam.subjectBn}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--suttro-primary)] suttro-transition" style={{ color: 'var(--suttro-deep)' }}>
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

        {/* ── CTA ── */}
        <section style={{ background: '#134E4A' }}>
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">আজই শুরু করো</h2>
            <p className="text-lg text-white/60 mb-8">
              সিমুলেশন, ক্লাস, MCQ সব ফ্রি — লগ ইন করে অগ্রগতি ট্র্যাক করো।
            </p>
            <div className="flex flex-col lg:flex-row gap-3 justify-center">
              <Link
                href="/guide"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[12px] text-lg font-semibold text-white suttro-transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', boxShadow: '0 4px 14px rgba(245,158,11,0.25)' }}
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
    </div>
  );
}
