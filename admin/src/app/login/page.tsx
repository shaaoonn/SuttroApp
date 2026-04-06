'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
      setLoading(false);
      return;
    }

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('লগইন ব্যর্থ হয়েছে।');
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--admin-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="admin-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
              সূত্র Admin
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>
              অ্যাডমিন প্যানেলে লগইন করুন
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="admin-label" htmlFor="email">ইমেইল</label>
              <input
                id="email"
                type="email"
                className="admin-input"
                placeholder="admin@suttro.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="admin-label" htmlFor="password">পাসওয়ার্ড</label>
              <input
                id="password"
                type="password"
                className="admin-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              className="admin-btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'লগইন হচ্ছে...' : 'লগইন'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
