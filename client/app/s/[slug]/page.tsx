import type { Metadata } from 'next';
import { PublicSelectionPage } from '@/src/pages/public-selection';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PublicSelectionSlugPage({ params }: { params: { slug: string } }) {
  return <PublicSelectionPage slug={params.slug} />;
}
