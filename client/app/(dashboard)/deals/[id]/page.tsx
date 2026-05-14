import { DealDetailClient } from '@/screens/deal-details/ui/deal-details-screen';

export default function DealDetailPage({ params }: { params: { id: string } }) {
  return <DealDetailClient dealId={params.id} />;
}
