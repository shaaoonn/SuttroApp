export const dynamic = 'force-dynamic';

import { supabaseAdmin } from '@/lib/supabase-admin';
import SimulationsTable from './SimulationsTable';

// ─────────────────────────────────────────────
// Simulations list — admin-editable metadata
// Code defines the simulation; this table edits text/media/visibility.
// ─────────────────────────────────────────────

export interface SimRow {
  id: number;
  slug: string;
  title_bn: string;
  title_en: string | null;
  subject: string;
  nctb_class: number;
  nctb_chapter: number;
  status: 'public' | 'private' | 'deleted';
  order_index: number;
  youtube_url: string | null;
  thumbnail_url: string | null;
  updated_at: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

async function getSims(): Promise<SimRow[]> {
  const { data } = await supabaseAdmin
    .from('simulations')
    .select(
      'id, slug, title_bn, title_en, subject, nctb_class, nctb_chapter, status, order_index, youtube_url, thumbnail_url, updated_at',
    )
    .neq('status', 'deleted')
    .order('order_index', { ascending: true });
  return (data ?? []) as SimRow[];
}

export default async function SimulationsAdminPage() {
  const sims = await getSims();
  const enriched = sims.map((s) => ({
    ...s,
    subjectBn: SUBJECT_LABELS[s.subject] || s.subject,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
            মোট {sims.length}টি সিমুলেশন
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>
            নতুন সিমুলেশন কোড থেকে যুক্ত হয় (Claude সাহায্য করতে পারে)। এই পেজে শুধু text, ভিডিও, থামনেল ও visibility এডিট করা যায়।
          </p>
        </div>
      </div>
      <SimulationsTable simulations={enriched} />
    </div>
  );
}
