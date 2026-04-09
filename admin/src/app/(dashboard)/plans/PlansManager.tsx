'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-browser';

interface Plan {
  id: string;
  name_bn: string;
  price_bdt: number;
  duration_days: number;
  features: Record<string, unknown>;
  display_features: string[];
  badge_text: string;
  highlight: boolean;
  cta_text: string;
  period_text: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_PLAN: Omit<Plan, 'id'> & { id: string } = {
  id: '',
  name_bn: '',
  price_bdt: 0,
  duration_days: 30,
  features: {
    exams_per_day: -1,
    practice_per_day: -1,
    ai_questions_per_day: 10,
    videos: -1,
    ads: false,
    certificates: false,
    offline: false,
    priority_support: false,
  },
  display_features: [],
  badge_text: '',
  highlight: false,
  cta_text: 'বিকাশে পে করো',
  period_text: '/মাস',
  sort_order: 0,
  is_active: true,
};

export default function PlansManager({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Feature display text input
  const [newFeatureText, setNewFeatureText] = useState('');

  function openNew() {
    setEditing({ ...EMPTY_PLAN, sort_order: plans.length + 1 });
    setIsNew(true);
    setError('');
    setSuccess('');
  }

  function openEdit(plan: Plan) {
    setEditing({ ...plan, display_features: plan.display_features ?? [], features: plan.features ?? {} });
    setIsNew(false);
    setError('');
    setSuccess('');
  }

  function closeEditor() {
    setEditing(null);
    setIsNew(false);
    setNewFeatureText('');
  }

  function addDisplayFeature() {
    if (!newFeatureText.trim() || !editing) return;
    setEditing({ ...editing, display_features: [...editing.display_features, newFeatureText.trim()] });
    setNewFeatureText('');
  }

  function removeDisplayFeature(idx: number) {
    if (!editing) return;
    setEditing({ ...editing, display_features: editing.display_features.filter((_, i) => i !== idx) });
  }

  function updateFeature(key: string, value: unknown) {
    if (!editing) return;
    setEditing({ ...editing, features: { ...editing.features, [key]: value } });
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.id.trim()) { setError('Plan ID দিন (যেমন: basic, gold)'); return; }
    if (!editing.name_bn.trim()) { setError('প্ল্যানের নাম দিন'); return; }

    setSaving(true);
    setError('');

    const payload = {
      id: editing.id.trim().toLowerCase(),
      name_bn: editing.name_bn,
      price_bdt: editing.price_bdt,
      duration_days: editing.duration_days,
      features: editing.features,
      display_features: editing.display_features,
      badge_text: editing.badge_text,
      highlight: editing.highlight,
      cta_text: editing.cta_text,
      period_text: editing.period_text,
      sort_order: editing.sort_order,
      is_active: editing.is_active,
    };

    const { error: err } = isNew
      ? await supabase.from('subscription_plans').insert(payload)
      : await supabase.from('subscription_plans').update(payload).eq('id', editing.id);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    // Refresh list
    const { data: fresh } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    setPlans(fresh ?? []);
    setSuccess(isNew ? 'নতুন প্ল্যান তৈরি হয়েছে!' : 'প্ল্যান আপডেট হয়েছে!');
    setSaving(false);
    setTimeout(() => setSuccess(''), 3000);
    closeEditor();
  }

  async function toggleActive(plan: Plan) {
    await supabase
      .from('subscription_plans')
      .update({ is_active: !plan.is_active })
      .eq('id', plan.id);

    setPlans(plans.map((p) => (p.id === plan.id ? { ...p, is_active: !p.is_active } : p)));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
          মোট {plans.length}টি প্ল্যান
        </p>
        <button onClick={openNew} className="admin-btn-primary">+ নতুন প্ল্যান</button>
      </div>

      {success && (
        <div className="p-3 rounded-lg text-sm text-green-700 bg-green-50 border border-green-200">
          {success}
        </div>
      )}

      {/* Plans list */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--admin-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--admin-card)', borderBottom: '1px solid var(--admin-border)' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--admin-muted)' }}>প্ল্যান</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--admin-muted)' }}>মূল্য</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--admin-muted)' }}>মেয়াদ</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--admin-muted)' }}>ফিচার</th>
              <th className="text-center px-4 py-3 font-medium" style={{ color: 'var(--admin-muted)' }}>স্ট্যাটাস</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--admin-muted)' }}>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                style={{ borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-bg)' }}
              >
                <td className="px-4 py-3">
                  <div className="font-medium" style={{ color: 'var(--admin-text)' }}>
                    {plan.name_bn}
                    {plan.badge_text && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                        {plan.badge_text}
                      </span>
                    )}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--admin-muted)' }}>ID: {plan.id}</div>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--admin-text)' }}>
                  ৳{Math.round(plan.price_bdt / 100)}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--admin-text)' }}>
                  {plan.duration_days} দিন
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs space-y-0.5" style={{ color: 'var(--admin-muted)' }}>
                    {(plan.display_features ?? []).slice(0, 3).map((f, i) => (
                      <div key={i}>✓ {f}</div>
                    ))}
                    {(plan.display_features ?? []).length > 3 && (
                      <div>+{(plan.display_features ?? []).length - 3} আরো</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(plan)}
                    className={`text-xs px-2 py-1 rounded-full ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                  >
                    {plan.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(plan)}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--admin-primary)', color: 'white' }}
                  >
                    সম্পাদনা
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-10 z-50 overflow-y-auto">
          <div
            className="rounded-xl p-6 w-full max-w-2xl my-6"
            style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--admin-text)' }}>
              {isNew ? 'নতুন প্ল্যান তৈরি' : `সম্পাদনা: ${editing.name_bn}`}
            </h2>

            {error && <div className="p-3 mb-4 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">{error}</div>}

            <div className="space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--admin-muted)' }}>
                    Plan ID {isNew && '(ইংরেজি, lowercase)'}
                  </label>
                  <input
                    value={editing.id}
                    onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                    disabled={!isNew}
                    placeholder="premium"
                    className="w-full px-3 py-2 rounded-lg text-sm border"
                    style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', borderColor: 'var(--admin-border)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--admin-muted)' }}>
                    নাম (বাংলা)
                  </label>
                  <input
                    value={editing.name_bn}
                    onChange={(e) => setEditing({ ...editing, name_bn: e.target.value })}
                    placeholder="প্রিমিয়াম"
                    className="w-full px-3 py-2 rounded-lg text-sm border"
                    style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', borderColor: 'var(--admin-border)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--admin-muted)' }}>
                    মূল্য (টাকা)
                  </label>
                  <input
                    type="number"
                    value={Math.round(editing.price_bdt / 100)}
                    onChange={(e) => setEditing({ ...editing, price_bdt: Number(e.target.value) * 100 })}
                    className="w-full px-3 py-2 rounded-lg text-sm border"
                    style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', borderColor: 'var(--admin-border)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--admin-muted)' }}>
                    মেয়াদ (দিন)
                  </label>
                  <input
                    type="number"
                    value={editing.duration_days}
                    onChange={(e) => setEditing({ ...editing, duration_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm border"
                    style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', borderColor: 'var(--admin-border)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--admin-muted)' }}>
                    পিরিয়ড টেক্সট
                  </label>
                  <input
                    value={editing.period_text}
                    onChange={(e) => setEditing({ ...editing, period_text: e.target.value })}
                    placeholder="/মাস"
                    className="w-full px-3 py-2 rounded-lg text-sm border"
                    style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', borderColor: 'var(--admin-border)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--admin-muted)' }}>
                    ব্যাজ টেক্সট
                  </label>
                  <input
                    value={editing.badge_text}
                    onChange={(e) => setEditing({ ...editing, badge_text: e.target.value })}
                    placeholder="জনপ্রিয়"
                    className="w-full px-3 py-2 rounded-lg text-sm border"
                    style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', borderColor: 'var(--admin-border)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--admin-muted)' }}>
                    বাটন টেক্সট
                  </label>
                  <input
                    value={editing.cta_text}
                    onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })}
                    placeholder="বিকাশে পে করো"
                    className="w-full px-3 py-2 rounded-lg text-sm border"
                    style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', borderColor: 'var(--admin-border)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--admin-muted)' }}>
                    ক্রম (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm border"
                    style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', borderColor: 'var(--admin-border)' }}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
                  <input
                    type="checkbox"
                    checked={editing.highlight}
                    onChange={(e) => setEditing({ ...editing, highlight: e.target.checked })}
                  />
                  হাইলাইটেড প্ল্যান
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
                  <input
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  />
                  সক্রিয়
                </label>
              </div>

              {/* Functional Features */}
              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--admin-text)' }}>
                  ফিচার লিমিট (সিস্টেম)
                </h3>
                <p className="text-xs mb-3" style={{ color: 'var(--admin-muted)' }}>
                  -1 = আনলিমিটেড
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'exams_per_day', label: 'পরীক্ষা/দিন' },
                    { key: 'practice_per_day', label: 'প্র্যাক্টিস/দিন' },
                    { key: 'ai_questions_per_day', label: 'AI প্রশ্ন/দিন' },
                    { key: 'videos', label: 'ভিডিও' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="text-xs w-28 shrink-0" style={{ color: 'var(--admin-muted)' }}>{label}</label>
                      <input
                        type="number"
                        value={(editing.features as Record<string, number>)[key] ?? 0}
                        onChange={(e) => updateFeature(key, Number(e.target.value))}
                        className="w-full px-2 py-1 rounded text-sm border"
                        style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', borderColor: 'var(--admin-border)' }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3">
                  {[
                    { key: 'ads', label: 'বিজ্ঞাপন' },
                    { key: 'certificates', label: 'সার্টিফিকেট' },
                    { key: 'offline', label: 'অফলাইন' },
                    { key: 'priority_support', label: 'সাপোর্ট' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-1 text-xs" style={{ color: 'var(--admin-text)' }}>
                      <input
                        type="checkbox"
                        checked={!!(editing.features as Record<string, boolean>)[key]}
                        onChange={(e) => updateFeature(key, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Display Features */}
              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--admin-text)' }}>
                  প্রদর্শনীয় ফিচার (Pricing পেজে দেখাবে)
                </h3>
                <div className="space-y-2 mb-3">
                  {editing.display_features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm flex-1 px-2 py-1 rounded" style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)' }}>
                        ✓ {f}
                      </span>
                      <button
                        onClick={() => removeDisplayFeature(i)}
                        className="text-red-500 text-xs px-2 py-1 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDisplayFeature()}
                    placeholder="নতুন ফিচার লিখুন..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm border"
                    style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', borderColor: 'var(--admin-border)' }}
                  />
                  <button
                    onClick={addDisplayFeature}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--admin-primary)', color: 'white' }}
                  >
                    যোগ
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--admin-border)' }}>
              <button
                onClick={closeEditor}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: 'var(--admin-muted)' }}
              >
                বাতিল
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ background: 'var(--admin-primary)', color: 'white' }}
              >
                {saving ? 'সেভ হচ্ছে...' : isNew ? 'তৈরি করো' : 'আপডেট করো'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
