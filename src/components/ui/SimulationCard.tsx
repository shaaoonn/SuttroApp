import Link from 'next/link';
import type { SimulationConfig } from '@/simulations/_template/config';

// ─────────────────────────────────────────────
// SimulationCard — Gallery card for simulations
// ─────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, string> = {
  physics: 'bg-physics',
  chemistry: 'bg-chemistry',
  biology: 'bg-biology',
  math: 'bg-subject-math',
  'higher-math': 'bg-subject-higher-math',
  english: 'bg-subject-english',
};

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

interface SimulationCardProps {
  config: SimulationConfig;
  slug: string;
}

export default function SimulationCard({ config, slug }: SimulationCardProps) {
  return (
    <Link
      href={`/sim/${slug}`}
      className="group block rounded-[14px] border overflow-hidden suttro-transition hover:shadow-lg hover:-translate-y-1"
      style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
    >
      {/* Color bar */}
      <div className={`h-2 ${SUBJECT_COLORS[config.subject]}`} />

      <div className="p-5">
        {/* Subject tag */}
        <span
          className={`${SUBJECT_COLORS[config.subject]} inline-block px-2 py-0.5 rounded text-xs text-white font-medium mb-3`}
        >
          {SUBJECT_LABELS[config.subject]} · অধ্যায় {config.nctb.chapter}
        </span>

        {/* Title */}
        <h3
          className="text-lg font-semibold mb-1"
          style={{ color: 'var(--suttro-deep)' }}
        >
          {config.title.bn}
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--suttro-muted)' }}>
          {config.title.en} · ক্লাস {config.nctb.class}
        </p>

        {/* Formulas preview */}
        {config.formulas.length > 0 && (
          <div className="flex gap-2 mb-4">
            {config.formulas.map((f, i) => (
              <span
                key={i}
                className="font-mono text-xs px-2 py-1 rounded"
                style={{ background: 'var(--suttro-sky)', color: 'var(--suttro-deep)' }}
              >
                {f.expression}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <span
          className="text-sm font-medium group-hover:gap-3 inline-flex items-center gap-2 suttro-transition"
          style={{ color: 'var(--suttro-primary)' }}
        >
          সিমুলেশন চালাও
          <span className="suttro-transition group-hover:translate-x-1 inline-block">&rarr;</span>
        </span>
      </div>
    </Link>
  );
}
