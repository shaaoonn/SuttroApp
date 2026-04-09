'use client';

import dynamic from 'next/dynamic';

const ChapterMastery = dynamic(() => import('./ChapterMastery'), {
  ssr: false,
});

interface Props {
  subjectId: string;
  totalChapters: number;
  color: string;
}

export default function ChapterMasteryLoader(props: Props) {
  return <ChapterMastery {...props} />;
}
