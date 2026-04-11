'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────
// Admin Notification Panel
// Send push notifications to users
// ─────────────────────────────────────────────

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  type: string;
  target: string;
  sent_at: string;
  read_count: number;
}

export default function AdminNotifications() {
  const { session, supabase } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('general');
  const [path, setPath] = useState('/');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Check admin access
  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    const role =
      session.user?.user_metadata?.role || session.user?.app_metadata?.role;
    if (role !== 'admin') {
      router.push('/');
    }
  }, [session, router]);

  // Load notification history
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);
      setHistory(data || []);
      setLoading(false);
    })();
  }, [supabase]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setError('শিরোনাম ও বিবরণ লিখুন');
      return;
    }

    setSending(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ title, body, type, path, target }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'পাঠাতে ব্যর্থ');
      } else {
        setResult({ sent: data.sent, failed: data.failed });
        setTitle('');
        setBody('');
        setPath('/');
        // Refresh history
        if (supabase) {
          const { data: h } = await supabase
            .from('notifications')
            .select('*')
            .order('sent_at', { ascending: false })
            .limit(20);
          setHistory(h || []);
        }
      }
    } catch {
      setError('নেটওয়ার্ক ত্রুটি');
    } finally {
      setSending(false);
    }
  };

  const typeLabels: Record<string, string> = {
    general: 'সাধারণ',
    class: 'নতুন ক্লাস',
    exam: 'পরীক্ষা',
    daily: 'আজকের পড়া',
  };

  const targetLabels: Record<string, string> = {
    all: 'সবাই',
    class_9: 'নবম শ্রেণি',
    class_10: 'দশম শ্রেণি',
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            বিজ্ঞপ্তি পাঠান
          </h1>
        </div>

        {/* Send Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              শিরোনাম
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="বিজ্ঞপ্তির শিরোনাম..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              বিবরণ
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="বিজ্ঞপ্তির বিস্তারিত..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ধরন
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(typeLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    type === key
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              প্রাপক
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(targetLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTarget(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    target === key
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Deep Link Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              লিংক পাথ
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/guide/physics-9"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              ক্লিক করলে কোন পেজে যাবে (যেমন: /guide/physics-9, /exams, /)
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm">
              সফলভাবে পাঠানো হয়েছে! {result.sent} জনকে পৌঁছেছে
              {result.failed > 0 && `, ${result.failed} জনকে পৌঁছায়নি`}
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !body.trim()}
            className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                পাঠানো হচ্ছে...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                বিজ্ঞপ্তি পাঠান
              </>
            )}
          </button>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            সাম্প্রতিক বিজ্ঞপ্তি
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">লোড হচ্ছে...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">কোনো বিজ্ঞপ্তি পাঠানো হয়নি</div>
          ) : (
            <div className="space-y-3">
              {history.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                        {typeLabels[n.type] || n.type}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {targetLabels[n.target] || n.target}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>
                      {new Date(n.sent_at).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>{n.read_count} জন পড়েছে</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
