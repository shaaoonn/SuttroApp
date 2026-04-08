'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const plan = params.get('plan');
  const trxId = params.get('trxId');

  const planNames: Record<string, string> = {
    premium: 'প্রিমিয়াম',
    pro: 'প্রো',
  };

  return (
    <div style={{ background: 'var(--suttro-surface)', minHeight: '70vh' }}>
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--suttro-deep)' }}>
          পেমেন্ট সফল!
        </h1>
        <p className="text-base mb-2" style={{ color: 'var(--suttro-text)' }}>
          তোমার <strong>{planNames[plan ?? ''] ?? plan}</strong> সাবস্ক্রিপশন সক্রিয় হয়েছে।
        </p>
        {trxId && (
          <p className="text-sm mb-8" style={{ color: 'var(--suttro-muted)' }}>
            ট্রান্সেকশন আইডি: {trxId}
          </p>
        )}

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block py-3 rounded-[10px] text-base font-medium text-white"
            style={{ background: 'var(--suttro-primary)' }}
          >
            ড্যাশবোর্ডে যাও
          </Link>
          <Link
            href="/exams"
            className="block py-3 rounded-[10px] text-base font-medium"
            style={{ color: 'var(--suttro-primary)', border: '1.5px solid var(--suttro-primary)' }}
          >
            পরীক্ষা দাও
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
