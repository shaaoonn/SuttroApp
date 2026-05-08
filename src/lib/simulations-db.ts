// ─────────────────────────────────────────────
// Simulation metadata data access layer
// Reads from `simulations` table + merges with code registry.
//
// DB is the source of truth for editable metadata
// (title, description, thumbnail, video, status).
// Registry is the source of truth for the actual component.
// ─────────────────────────────────────────────

import { getSupabase } from './supabase-server';
import { simulations as registry } from '@/simulations/registry';
import type { SimulationConfig } from '@/simulations/_template/config';

export interface SimMeta {
  slug: string;
  title_bn: string;
  title_en: string | null;
  description_bn: string | null;
  description_en: string | null;
  long_description_bn: string | null;
  subject: string;
  nctb_class: number;
  nctb_chapter: number;
  nctb_section: string | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  thumbnail_svg: string | null;
  status: 'public' | 'private' | 'deleted';
  order_index: number;
  tags: string[] | null;
  duration_minutes: number | null;
  difficulty: number | null;
}

/** Returned to public gallery — combines DB row + registry config */
export interface PublicSim {
  meta: SimMeta;
  /** Code-side config (variables, formulas) — kept for backward compat */
  config: SimulationConfig;
  /** True if a code component is registered for this slug */
  hasComponent: boolean;
}

/**
 * Load all public simulations (status='public') with their registered
 * components. Filters out deleted/private and any DB rows whose code
 * has been removed.
 */
export async function getPublicSimulations(): Promise<PublicSim[]> {
  const supabase = getSupabase();
  if (!supabase) return fallbackFromRegistry();

  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('status', 'public')
    .order('order_index', { ascending: true });

  if (error || !data) return fallbackFromRegistry();

  const out: PublicSim[] = [];
  for (const row of data as SimMeta[]) {
    const reg = registry.find((r) => r.slug === row.slug);
    if (!reg) continue; // Don't show DB rows whose code is missing
    out.push({ meta: row, config: reg.config, hasComponent: true });
  }
  return out;
}

/** Load a single simulation by slug (any status — for sim page server) */
export async function getSimulationMeta(slug: string): Promise<SimMeta | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('slug', slug)
    .neq('status', 'deleted')
    .maybeSingle();

  if (error) return null;
  return (data as SimMeta) ?? null;
}

/**
 * Fallback when Supabase is not configured (local dev without DB).
 * Returns registry entries with stub metadata so the app still works.
 */
function fallbackFromRegistry(): PublicSim[] {
  return registry.map((r, i) => ({
    meta: {
      slug: r.slug,
      title_bn: r.config.title.bn,
      title_en: r.config.title.en ?? null,
      description_bn: null,
      description_en: null,
      long_description_bn: null,
      subject: r.config.subject,
      nctb_class: r.config.nctb.class,
      nctb_chapter: r.config.nctb.chapter,
      nctb_section: r.config.nctb.section ?? null,
      youtube_url: null,
      thumbnail_url: null,
      thumbnail_svg: null,
      status: 'public' as const,
      order_index: i + 1,
      tags: null,
      duration_minutes: null,
      difficulty: null,
    },
    config: r.config,
    hasComponent: true,
  }));
}
