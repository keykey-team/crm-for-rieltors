import { DealDetailClient } from '@/entities/deal';

export function DealDetailsPage({ params }: { params: { id: string } }) {
  return <DealDetailClient dealId={params.id} />;
}
