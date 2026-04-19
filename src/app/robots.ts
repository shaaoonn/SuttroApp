import type { MetadataRoute } from 'next';

const SITE_URL = 'https://suttro.app';

// ─────────────────────────────────────────────
// robots.txt - served at /robots.txt
//
// Strategy:
//   • Allow public content to everyone (homepage, simulations, guide, exams,
//     class archive, about, privacy, terms, refund)
//   • Block auth-protected + app-internal routes (admin, API, dashboard,
//     profile, payment callback, user-specific pages) from crawlers
//   • Block AI training crawlers that don't drive human traffic
//     (keep Googlebot, Bingbot, DuckDuckBot allowed)
// ─────────────────────────────────────────────

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/simulations',
          '/sim/',
          '/classes',
          '/class/',
          '/guide',
          '/guide/',
          '/exams',
          '/exam/',
          '/daily',
          '/about',
          '/pricing',
          '/privacy',
          '/terms',
          '/refund',
          '/login',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/dashboard',
          '/profile',
          '/delete-account',
          '/onboarding',
          '/payment/',
          '/review/',
          '/achievements',
          '/leaderboard',
          '/_next/',
          '/*.json$',
        ],
      },
      // Block AI training crawlers (they consume bandwidth, don't send traffic)
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'ClaudeBot', disallow: '/' },
      { userAgent: 'anthropic-ai', disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
      { userAgent: 'PerplexityBot', disallow: '/' },
      { userAgent: 'Bytespider', disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
