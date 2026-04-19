'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { trackEvent, type EventType, type ContentType } from '@/lib/analytics';

// ─────────────────────────────────────────────
// ContentTracker - Invisible component that
// fires a trackEvent when mounted (page view)
// ─────────────────────────────────────────────

interface ContentTrackerProps {
  eventType: EventType;
  contentType: ContentType;
  contentId: string;
}

export default function ContentTracker({ eventType, contentType, contentId }: ContentTrackerProps) {
  const { session } = useAuth();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    trackEvent(
      { eventType, contentType, contentId },
      session?.access_token,
    );
  }, [eventType, contentType, contentId, session?.access_token]);

  return null; // Invisible component
}
