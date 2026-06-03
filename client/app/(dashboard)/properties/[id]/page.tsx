import { PropertyProfilePage } from '@/src/pages/property-profile';

export default function PropertyProfileRoutePage({ params }: { params: { id: string } }) {
  return <PropertyProfilePage propertyId={params.id} />;
}
