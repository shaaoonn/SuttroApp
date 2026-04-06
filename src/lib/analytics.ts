// ─────────────────────────────────────────────
// Client-side analytics — track user activity
// Only works for authenticated users
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

export async function trackEvent(payload: TrackPayload): Promise<void> {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

export async function saveExamAttempt(payload: ExamAttemptPayload): Promise<void> {
  try {
    await fetch('/api/exam-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent fail
  }
}
