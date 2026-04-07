// ─────────────────────────────────────────────
// Client-side analytics — track user activity
// Passes auth token via Authorization header
// since main app uses localStorage (not cookies)
// ─────────────────────────────────────────────

export type EventType =
  | 'exam_started'
  | 'exam_completed'
  | 'class_opened'
  | 'sim_opened'
  | 'cq_viewed';

export type ContentType = 'exam' | 'class' | 'simulation' | 'cq';

interface TrackPayload {
  eventType: EventType;
  contentType: ContentType;
  contentId: string;
  metadata?: Record<string, unknown>;
}

export async function trackEvent(
  payload: TrackPayload,
  accessToken?: string,
): Promise<void> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    await fetch('/api/track', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent fail — analytics should never break the app
  }
}

interface ExamAttemptPayload {
  examPaperId: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  durationSeconds: number;
  answers: (number | null)[];
}

export async function saveExamAttempt(
  payload: ExamAttemptPayload,
  accessToken?: string,
): Promise<void> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    await fetch('/api/exam-attempt', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent fail
  }
}
