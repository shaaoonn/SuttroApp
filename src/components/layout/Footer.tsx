import Link from 'next/link';

// ─────────────────────────────────────────────
// Footer — সূত্র | suttro.app
// ─────────────────────────────────────────────

const FOOTER_LINKS = {
  platform: [
    { href: '/simulations', label: 'সিমুলেশন' },
    { href: '/classes', label: 'ক্লাস আর্কাইভ' },
    { href: '/pricing', label: 'প্রাইসিং' },
  ],
  subjects: [
    { href: '/simulations?subject=physics', label: 'পদার্থবিজ্ঞান' },
    { href: '/simulations?subject=chemistry', label: 'রসায়ন' },
    { href: '/simulations?subject=biology', label: 'জীববিজ্ঞান' },
    { href: '/simulations?subject=math', label: 'সাধারণ গণিত' },
    { href: '/simulations?subject=higher-math', label: 'উচ্চতর গণিত' },
    { href: '/simulations?subject=english', label: 'ইংরেজি' },
  ],
  company: [
    { href: '/about', label: 'আমাদের সম্পর্কে' },
    { href: 'https://ejobsit.com', label: 'EJOSB IT', external: true },
  ],
};

export default function Footer() {
  return (
    <footer
      className="border-t mt-auto"
      style={{ background: 'var(--suttro-deep)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-2">সূত্র</h3>
            <p className="text-xs text-white/40 mb-1">suttro.app</p>
            <p className="text-sm text-white/60 mt-3 leading-relaxed">
              বিজ্ঞান দেখো, বিজ্ঞান বোঝো।
            </p>
            <p className="text-xs text-white/30 mt-2">
              NCTB ক্লাস ৯-১০
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-3">প্ল্যাটফর্ম</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white/80 suttro-transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-3">বিষয়</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.subjects.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white/80 suttro-transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-3">কোম্পানি</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white/80 suttro-transition"
                    {...('external' in link ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-white/30"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p>&copy; {new Date().getFullYear()} সূত্র | suttro.app — EJOSB IT</p>
          <p>বিজ্ঞান পড়া নয়, বিজ্ঞান করা।</p>
        </div>
      </div>
    </footer>
  );
}
