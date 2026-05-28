import type { Agency } from '../model/types';

export function AgencyAvatar({ agency }: { agency: Agency }) {
  if (agency.brandLogo) {
    return <img src={agency.brandLogo} alt={agency.name} className="h-6 w-6 rounded-full object-cover" />;
  }

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {agency.name.slice(0, 1).toUpperCase()}
    </div>
  );
}
