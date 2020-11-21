export type ServerEventType = 'joined' | 'left' | 'waiting' | 'matched' | 'opened' | 'finished' | 'error';
export type ClientEventType = 'register' | 'ready' | 'open' | 'next';
export type EventType = ServerEventType | ClientEventType;

export type JoinedEventPayload = { token: string };
export type ErrorEventPayload = { message: string };
export type JoinEventPayload = { nickname: string, present: string };
export type EventPayload =
  JoinedEventPayload | ErrorEventPayload |
  JoinEventPayload;

export type EventMessage = {
  event: EventType,
  payload: EventPayload,
}

export type EventCallbackContext = {
  // eslint-disable-next-line no-use-before-define
  respond: (event: Event) => void,
};

export class Event {
  eventType: EventType;

  payload: EventPayload;

  constructor(eventType: EventType, payload?: EventPayload) {
    this.eventType = eventType;
    this.payload = payload || null;
  }

  after(_: EventCallbackContext): void {
    // do nothing...
  }

  toMessage(): string {
    return JSON.stringify({ event: this.eventType, payload: this.payload });
  }
}

/// Server Side Events
export class JoinedEvent extends Event {
  constructor(payload: JoinedEventPayload) {
    super('joined', payload);
  }
}

export class ErrorEvent extends Event {
  constructor(payload: ErrorEventPayload) {
    super('error', payload);
  }

  after({ respond }: EventCallbackContext): void {
    respond(this);
  }
}

/// Client Side Events

export function eventFromMessage(message: string): Event {
  let msgObj: EventMessage;
  try {
    msgObj = JSON.parse(message) as EventMessage;
  } catch {
    return new ErrorEvent({ message: 'invalid message' });
  }

  switch (msgObj.event) {
    default:
      return new ErrorEvent({ message: `no such event: ${msgObj.event}` });
  }
}
