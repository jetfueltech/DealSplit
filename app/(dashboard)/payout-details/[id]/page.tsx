import { notFound } from 'next/navigation';
import PayoutDetailsClient from './payout-details-client';

export async function generateStaticParams() {
  const payouts = storage.getPayouts();
  return payouts.map((payout) => ({
    id: payout.id,
  }));
}

import { storage } from '@/lib/storage';

function getPayoutData(id: string) {
  const payouts = storage.getPayouts();
  return payouts.find(payout => payout.id === id);
}

// Server Component
export default function PayoutDetails({ params }: { params: { id: string } }) {
  const payout = getPayoutData(params.id);
  
  if (!payout) {
    notFound();
  }

  return <PayoutDetailsClient initialPayout={payout} />;
}