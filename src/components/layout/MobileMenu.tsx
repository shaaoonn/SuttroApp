'use client';

import Link from 'next/link';

// ─────────────────────────────────────────────
// MobileMenu — Full-screen slide-down menu
// ─────────────────────────────────────────────

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  subjectLinks: { href: string; label: string; color: string }[];
}

export default function MobileMenu({ open, onClose, links, subjectLinks }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 lg:hidden"
      style={{ background: 'rgba(250, 251, 249, 0.98)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex flex-col pt-20 px-6 gap-2">
        {/* Subject section */}
        <p
          className="text-sm font-semibold uppercase tracking-wider mt-4 mb-2"
          style={{ color: 'var(--suttro-muted)' }}
        >
          বিষয়
        </p>
        <div className="flex gap-2 mb-4">
          {subjectLinks.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              onClick={onClose}
              className={`${s.color} px-5 py-3 rounded-[10px] text-base text-white font-medium`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Nav links */}
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="flex items-center py-4 px-4 rounded-[10px] text-lg hover:bg-black/5 suttro-transition"
            style={{ color: 'var(--suttro-text)' }}
          >
            {link.label}
          </Link>
        ))}

        {/* Login button */}
        <Link
          href="/login"
          onClick={onClose}
          className="mt-4 flex items-center justify-center py-4 px-4 rounded-[12px] text-lg font-semibold text-white"
          style={{ background: 'var(--suttro-primary)' }}
        >
          লগ ইন
        </Link>

        {/* Tagline */}
        <p
          className="text-center text-sm mt-8"
          style={{ color: 'var(--suttro-muted)' }}
        >
          বিজ্ঞান পড়া নয়, বিজ্ঞান করা।
        </p>
      </div>
    </div>
  );
}
