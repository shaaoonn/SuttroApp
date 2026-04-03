import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'লগ ইন — সূত্র | suttro.app',
};

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
      <div className="w-full max-w-sm px-4">
        <div
          className="rounded-[14px] border p-6 sm:p-8"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
              সূত্র-তে লগ ইন
            </h1>
            <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
              তোমার মোবাইল নম্বর দাও
            </p>
          </div>

          {/* Phone input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--suttro-text)' }}>
              মোবাইল নম্বর
            </label>
            <div className="flex gap-2">
              <span
                className="flex items-center px-3 rounded-[10px] text-sm border"
                style={{ borderColor: 'var(--suttro-border)', color: 'var(--suttro-muted)' }}
              >
                +880
              </span>
              <input
                type="tel"
                placeholder="1XXXXXXXXX"
                className="flex-1 px-4 py-3 rounded-[10px] text-sm border outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--suttro-border)',
                  color: 'var(--suttro-text)',
                  background: 'var(--suttro-surface)',
                }}
              />
            </div>
          </div>

          <button
            className="w-full py-3 rounded-[10px] text-sm font-medium text-white suttro-transition hover:opacity-90"
            style={{ background: 'var(--suttro-primary)' }}
          >
            OTP পাঠাও
          </button>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--suttro-muted)' }}>
            কোনো পাসওয়ার্ড লাগবে না — শুধু OTP দিয়ে লগ ইন।
          </p>
        </div>
      </div>
    </div>
  );
}
