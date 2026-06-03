import { ClientSelectionDetailsPage } from '@/src/pages/client-selection-details';

export default function SelectionDetailsRoutePage({ params }: { params: { id: string } }) {
  return <ClientSelectionDetailsPage selectionId={params.id} />;
}