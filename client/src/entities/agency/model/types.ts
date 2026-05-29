export type Agency = {
  id: string;
  name: string;
  slug: string;
  role: string;
  plan?: string;
  brandLogo?: string | null;
  brandName?: string | null;
  primaryColor?: string | null;
};

export type AgencyMember = {
  id: string;
  agencyId: string;
  userId: string;
  role: string;
  isActive: boolean;
  user?: { id: string; email: string; name?: string | null; avatar?: string | null };
};
