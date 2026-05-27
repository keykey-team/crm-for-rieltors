export const dynamic = 'force-dynamic';

import { LeadDetailClient } from '@/screens/lead-details/ui/lead-details-screen';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeadDetailClient leadId={id} />;
}
