'use client';

import dynamic from 'next/dynamic';

const YouTubePlayer = dynamic(
  () => import('@/components/player/YouTubePlayer'),
  { ssr: false }
);

interface YouTubePlayerWrapperProps {
  videoId: string;
  title: string;
  chapterTag?: string;
}

export default function YouTubePlayerWrapper(props: YouTubePlayerWrapperProps) {
  return <YouTubePlayer {...props} />;
}
