'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function FailedContent() {
  const params = useSearchParams();
  const reason = params.get('reason');

  const messages: Record<string, string> = {
    cancelled: 'তুমি পেমেন্ট বাতিল করেছো।',
    failed: 'পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করো।',
    execution_failed: 'বিকাশ পেমেন্ট প্রসেস করতে পারেনি।',
    server_error: 'সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করো।',
    missing_payment_id: 'পেমেন্ট তথ্য পাওয়া যায়নি।',
    missing_bkash_id: 'বিকাশ পেমেন্ট আইডি পাওয়া যায়নি।',
    payment_not_found: 'পেমেন্ট রেকর্ড পাওয়া যায়নি।',
  };

  return (
    <div style={{ background: 'var(--suttro-surface)', minHeight: '70vh' }}>
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="text-6xl mb-6">😔</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--suttro-deep)' }}>
          পেমেন্ট সফল হয়নি
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--suttro-text)' }}>
          {messages[reason ?? ''] ?? 'কিছু একটা ভুল হয়েছে।'}
        </p>

        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block py-3 rounded-[10px] text-base font-medium text-white"
            style={{ background: 'var(--suttro-primary)' }}
          >
            আবার চেষ্টা করো
          </Link>
          <Link
            href="/"
            className="block py-3 rounded-[10px] text-base font-medium"
            style={{ color: 'var(--suttro-primary)' }}
          >
            হোমে ফিরে যাও
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Loading...</div>}>
      <FailedContent />
    </Suspense>
  );
}
