import type { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'প্রাইসিং — সূত্র | suttro.app',
};

export default function PricingPage() {
  return <PricingClient />;
}
