import type { MetadataRoute } from 'next';
import { simulations } from '@/simulations/registry';
import { getClasses, getExams } from '@/lib/data';

const SITE_URL = 'https://suttro.app';

// ─────────────────────────────────────────────
// sitemap.xml - served at /sitemap.xml
//
// Includes:
//   • Static public pages (home, simulations, classes, guide, exams, about,
//     pricing, privacy, terms, refund)
//   • All individual simulation pages (/sim/<slug>) - long-tail SEO
//   • All class recording pages (/class/<slug>)
//   • All exam pages (/exam/<id>)
//
// NOT included (robots.txt blocks these):
//   • Admin, API, dashboard, profile, payment, onboarding, delete-account
// ─────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/simulations`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/classes`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/guide`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/exams`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/daily`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/refund`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Individual simulation pages - these are our SEO long-tail goldmine
  // (each targets queries like "ohm's law simulation bangla")
  const simPages: MetadataRoute.Sitemap = simulations.map((sim) => ({
    url: `${SITE_URL}/sim/${sim.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Dynamic pages - best-effort; ignore errors so build never breaks.
  let classPages: MetadataRoute.Sitemap = [];
  let examPages: MetadataRoute.Sitemap = [];
  try {
    const [classes, exams] = await Promise.all([getClasses(), getExams()]);
    classPages = classes.map((cls) => ({
      url: `${SITE_URL}/class/${cls.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
    examPages = exams.map((ex) => ({
      url: `${SITE_URL}/exam/${ex.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {
    // Sheet / DB unavailable at build time - static pages are still emitted.
  }

  return [...staticPages, ...simPages, ...classPages, ...examPages];
}
