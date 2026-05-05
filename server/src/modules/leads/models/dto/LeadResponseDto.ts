export class LeadResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string | null;
  email!: string | null;
  phone!: string;
  source!: string;
  status!: string;
  priority!: string;
  assignedToId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
