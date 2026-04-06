import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'সূত্র Admin Panel',
  description: 'Suttro content management and analytics dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
