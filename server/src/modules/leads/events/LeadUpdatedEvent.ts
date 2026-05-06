import { DomainEvent } from '../../../common/messaging';

export class LeadUpdatedEvent implements DomainEvent<{ leadId: string; userId: string }> {
  readonly name = 'leads.updated';
  readonly occurredAt = new Date();

  constructor(public readonly payload: { leadId: string; userId: string }) {}
}
