import { singleton } from 'tsyringe';
import { DomainEvent } from './events/base-event';

type EventHandler<T = unknown> = (event: DomainEvent<T>) => void | Promise<void>;

@singleton()
export class EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe<T = unknown>(eventName: string, handler: EventHandler<T>): void {
    const existingHandlers = this.handlers.get(eventName) ?? [];
    existingHandlers.push(handler as EventHandler);
    this.handlers.set(eventName, existingHandlers);
  }

  async publish<T = unknown>(event: DomainEvent<T>): Promise<void> {
    const handlers = this.handlers.get(event.name) ?? [];
    await Promise.all(handlers.map((handler) => Promise.resolve(handler(event))));
  }
}
