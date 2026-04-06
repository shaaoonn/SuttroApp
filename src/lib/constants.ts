// ─────────────────────────────────────────────
// Display constants — static, never changes
// Subject colors, labels, icons for UI rendering
// ─────────────────────────────────────────────

export const SUBJECT_COLORS: Record<string, string> = {
  physics: '#2563EB',
  chemistry: '#7C3AED',
  biology: '#059669',
  math: '#DC2626',
  'higher-math': '#EA580C',
  english: '#0891B2',
};

export const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

export const SUBJECT_ICONS: Record<string, string> = {
  physics: '⚡',
  chemistry: '🧪',
  biology: '🧬',
  math: '📐',
  'higher-math': '📊',
  english: '📝',
};

/** YouTube thumbnail URL helper */
export function ytThumb(videoId: string, quality: 'mq' | 'hq' | 'max' = 'mq'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}
