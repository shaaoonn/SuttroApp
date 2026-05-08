export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import SimulationEditForm from './SimulationEditForm';

// ─────────────────────────────────────────────
// Edit a simulation's metadata (server entry)
// ─────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditSimulationPage({ params }: PageProps) {
  const { slug } = await params;
  const { data, error } = await supabaseAdmin
    .from('simulations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/simulations"
          className="text-sm font-medium"
          style={{ color: 'var(--admin-primary)' }}
        >
          ← সিমুলেশন তালিকায় ফেরত
        </Link>
      </div>
      <SimulationEditForm initial={data} />
    </div>
  );
}
