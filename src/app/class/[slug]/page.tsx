import type { Metadata } from 'next';
import Link from 'next/link';

interface ClassPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClassPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `ক্লাস: ${slug} — সূত্র | suttro.app`,
  };
}

export default async function ClassPlayerPage({ params }: ClassPageProps) {
  const { slug } = await params;

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--suttro-muted)' }}>
          <Link href="/classes" className="hover:underline">ক্লাস আর্কাইভ</Link>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--suttro-text)' }}>{slug}</span>
        </nav>

        {/* Video Player Placeholder */}
        <div
          className="rounded-[14px] overflow-hidden shadow-lg mb-8 aspect-video flex items-center justify-center"
          style={{ background: 'var(--player-bg)' }}
        >
          <div className="text-center">
            <div className="text-5xl mb-4">▶</div>
            <p className="text-white/60 text-sm">
              HLS ভিডিও প্লেয়ার শীঘ্রই আসছে
            </p>
          </div>
        </div>

        {/* Below player info */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
              ক্লাস রেকর্ডিং
            </h1>
            <p className="text-sm mb-4" style={{ color: 'var(--suttro-muted)' }}>
              এই ক্লাসটি HLS স্ট্রিমিং দিয়ে দেখা যাবে। শীঘ্রই উপলব্ধ হচ্ছে।
            </p>
          </div>

          {/* Sidebar */}
          <div>
            <div
              className="rounded-[14px] border p-5"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
            >
              <button
                className="w-full py-2.5 rounded-[10px] text-sm font-medium mb-2 suttro-transition hover:opacity-90"
                style={{ background: 'var(--suttro-primary)', color: 'white' }}
              >
                &#8599; শেয়ার করো
              </button>
              <button
                className="w-full py-2.5 rounded-[10px] text-sm font-medium suttro-transition"
                style={{ border: '1.5px solid var(--suttro-border)', color: 'var(--suttro-text)' }}
              >
                &#11015; অফলাইন ডাউনলোড
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
