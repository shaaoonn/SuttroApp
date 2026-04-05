import Link from 'next/link';
import { simulations } from '@/simulations/registry';
import SimulationCard from '@/components/ui/SimulationCard';
import HeroSimulation from '@/components/home/HeroSimulation';
import { CLASSES, SUBJECT_COLORS, SUBJECT_LABELS, SUBJECT_ICONS, ytThumb } from '@/data/classes';

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
    title: 'ডেইলি ক্লাস রেকর্ডিং',
    desc: '১০ বছরের অভিজ্ঞ শিক্ষকের ক্লাস — যখন খুশি দেখো, বারবার দেখো।',
  },
  {
    icon: '📖',
    title: 'NCTB চ্যাপ্টার-ম্যাপড',
    desc: 'প্রতিটি সিমুলেশন NCTB বইয়ের অধ্যায়ের সাথে সরাসরি যুক্ত।',
  },
  {
    icon: '📱',
    title: 'মোবাইল + অফলাইন',
    desc: 'ফোনে চলে, ইন্টারনেট ছাড়াও চলে — ডাউনলোড করে রাখো।',
  },
];

const STATS = [
  { value: '13', label: 'সিমুলেশন' },
  { value: '13', label: 'ভিডিও ক্লাস' },
  { value: '6', label: 'বিষয়' },
  { value: '৯-১০', label: 'শ্রেণি' },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--suttro-deep)' }}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              বিজ্ঞান দেখো, বিজ্ঞান বোঝো।
            </h1>
            <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto mb-6">
              ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স সিমুলেশন — NCTB পাঠ্যবইয়ের প্রতিটি অধ্যায়,
              এখন তোমার হাতের মুঠোয়।
            </p>
            <div className="flex flex-col lg:flex-row gap-3 justify-center">
              <Link
                href="/simulations"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] text-base font-medium text-white suttro-transition hover:opacity-90"
                style={{ background: 'var(--suttro-primary)' }}
              >
                সিমুলেশন চালাও &rarr;
              </Link>
              <Link
                href="/classes"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] text-base font-medium suttro-transition hover:bg-white/15"
                style={{ color: 'white', border: '1.5px solid rgba(255,255,255,0.2)' }}
              >
                &#9654; ক্লাস দেখো
              </Link>
            </div>
          </div>

          {/* Live simulation in hero */}
          <div className="max-w-4xl mx-auto">
            <HeroSimulation />
            <p className="text-center text-xs text-white/30 mt-3">
              এটাই সূত্র — নিজে চালিয়ে দেখো &#9757;
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: 'var(--suttro-sky)' }}>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: 'var(--suttro-primary)' }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm mt-1"
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
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-10"
            style={{ color: 'var(--suttro-deep)' }}
          >
            কেন সূত্র?
          </h2>
          <div className="grid lg:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[14px] border p-6"
                style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: 'var(--suttro-deep)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--suttro-muted)' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Simulation Gallery Preview ── */}
      <section style={{ background: 'var(--suttro-white)' }}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--suttro-deep)' }}
            >
              সিমুলেশন
            </h2>
            <Link
              href="/simulations"
              className="text-sm font-medium suttro-transition hover:opacity-80"
              style={{ color: 'var(--suttro-primary)' }}
            >
              সব দেখো &rarr;
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((sim) => (
              <SimulationCard key={sim.slug} config={sim.config} slug={sim.slug} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Classes ── */}
      <section style={{ background: 'var(--suttro-surface)' }}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--suttro-deep)' }}
            >
              সাম্প্রতিক ক্লাস
            </h2>
            <Link
              href="/classes"
              className="text-sm font-medium suttro-transition hover:opacity-80"
              style={{ color: 'var(--suttro-primary)' }}
            >
              সব ক্লাস &rarr;
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-medium text-white"
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
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium text-white bg-black/70">
                    {cls.duration}
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3
                    className="text-base font-semibold mb-1 truncate group-hover:text-[var(--suttro-primary)] suttro-transition"
                    style={{ color: 'var(--suttro-deep)' }}
                  >
                    {cls.title}
                  </h3>
                  <div
                    className="flex items-center gap-2 text-sm"
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

      {/* ── Trust / Teacher Section ── */}
      <section style={{ background: 'var(--suttro-sky)' }}>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-lg mb-2" style={{ color: 'var(--suttro-deep)' }}>
            ১০ বছরের অভিজ্ঞতা, এক ক্লিকে।
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--suttro-muted)' }}>
            সূত্র তৈরি করেছে একজন অভিজ্ঞ বিজ্ঞান শিক্ষক — যিনি জানেন ঠিক কোথায় শিক্ষার্থীরা আটকে যায়,
            আর কীভাবে interactive simulation দিয়ে সেই গ্যাপ পূরণ করা যায়।
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--suttro-deep)' }}>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            আজই শুরু করো
          </h2>
          <p className="text-base text-white/60 mb-6">
            ফ্রি সিমুলেশন চালাও — কোনো অ্যাকাউন্ট লাগবে না।
          </p>
          <Link
            href="/simulations"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[10px] text-base font-semibold suttro-transition hover:opacity-90"
            style={{ background: 'var(--suttro-accent)', color: 'var(--suttro-deep)' }}
          >
            সিমুলেশন চালাও &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
