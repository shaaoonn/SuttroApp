import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="flex-1 flex items-center justify-center"
      style={{ background: 'var(--suttro-surface)' }}
    >
      <div className="text-center px-4">
        <div className="text-6xl font-bold mb-4" style={{ color: 'var(--suttro-primary)' }}>
          ৪০৪
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
          পেজ পাওয়া যায়নি
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--suttro-muted)' }}>
          তুমি যে পেজ খুঁজছ সেটা এখানে নেই। হয়তো URL ভুল হয়েছে।
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-sm font-medium text-white suttro-transition hover:opacity-90"
          style={{ background: 'var(--suttro-primary)' }}
        >
          &larr; হোমে ফিরে যাও
        </Link>
      </div>
    </div>
  );
}
