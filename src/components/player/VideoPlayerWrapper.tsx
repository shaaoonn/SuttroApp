'use client';

import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(
  () => import('@/components/player/VideoPlayer'),
  { ssr: false }
);

interface VideoPlayerWrapperProps {
  src: string;
  title: string;
  chapterTag?: string;
  poster?: string;
}

export default function VideoPlayerWrapper(props: VideoPlayerWrapperProps) {
  return <VideoPlayer {...props} />;
}
