export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-suttro-surface">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-suttro-deep">সূত্র</h1>
        <p className="text-xl text-suttro-muted font-display italic">suttro.app</p>
        <p className="text-lg text-suttro-text">
          বিজ্ঞান দেখো, বিজ্ঞান বোঝো।
        </p>
        <div className="flex gap-4">
          <span className="inline-block rounded-[10px] bg-physics px-4 py-2 text-sm text-white">
            পদার্থবিজ্ঞান
          </span>
          <span className="inline-block rounded-[10px] bg-chemistry px-4 py-2 text-sm text-white">
            রসায়ন
          </span>
          <span className="inline-block rounded-[10px] bg-biology px-4 py-2 text-sm text-white">
            জীববিজ্ঞান
          </span>
        </div>
        <p className="text-sm text-suttro-muted">
          NCTB ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স সিমুলেশন
        </p>
      </main>
    </div>
  );
}
