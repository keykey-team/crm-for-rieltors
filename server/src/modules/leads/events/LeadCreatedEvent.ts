import { DomainEvent } from '../../../common/messaging';

export class LeadCreatedEvent implements DomainEvent<{ leadId: string; userId: string }> {
  readonly name = 'leads.created';
  readonly occurredAt = new Date();

  constructor(public readonly payload: { leadId: string; userId: string }) {}
}
