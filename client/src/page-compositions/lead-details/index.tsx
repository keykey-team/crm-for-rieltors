import { LeadDetailClient } from '@/entities/lead';

export async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeadDetailClient leadId={id} />;
}
