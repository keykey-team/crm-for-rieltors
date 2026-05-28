export function AgencyBadge({ role }: { role: string }) {
  return <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">{role}</span>;
}
