import { Repository } from './repository';

export type ServerEventType = 'joined' | 'left' | 'waiting' | 'matched' | 'opened' | 'finished' | 'error';
export type ClientEventType = 'register' | 'ready' | 'open' | 'next';
export type EventType = ServerEventType | ClientEventType;

export type JoinedEventPayload = { token: string };
export type WaitingEventPayload = { users: string[], readiedUsers: string[] };
export type ErrorEventPayload = { message: string };
export type RegisterEventPayload = { nickname: string, present: string };
export type EventPayload = JoinedEventPayload | WaitingEventPayload | ErrorEventPayload | RegisterEventPayload;

export type EventMessage = {
  event: EventType,
  payload: EventPayload,
}

export type EventCallbackContext = {
  clientId: string,
  repository: Repository,
  broadcast: (event: Event) => void,
  respond: (event: Event) => void,
};

export class Event {
  eventType: EventType;

  payload: EventPayload;

  constructor(eventType: EventType, payload?: EventPayload) {
    this.eventType = eventType;
    this.payload = payload || null;
  }

  async before(_: EventCallbackContext): Promise<Event> {
    return this;
  }

  async after(_: EventCallbackContext): Promise<void> {
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

export class WaitingEvent extends Event {
  constructor() {
    super('waiting');
  }

  async before({ repository }: EventCallbackContext): Promise<Event> {
    const allUser = await repository.getUserInfoAll();
    const readiedClients = await repository.listReadiedClient();
    this.payload = {
      users: Object.entries(allUser).map(([_, v]) => v.nickname),
      readiedUsers: readiedClients.map((id) => allUser[id].nickname),
    };
    return this;
  }
}

export class ErrorEvent extends Event {
  constructor(payload: ErrorEventPayload) {
    super('error', payload);
  }

  async after({ respond }: EventCallbackContext): Promise<void> {
    respond(this);
  }
}

/// Client Side Events
export class RegisterEvent extends Event {
  constructor(payload: RegisterEventPayload) {
    super('register', payload);
  }

  async after(ctx: EventCallbackContext): Promise<void> {
    const { nickname, present } = this.payload as RegisterEventPayload;
    await ctx.repository.setUserInfo(ctx.clientId, nickname, present);
    ctx.broadcast(await new WaitingEvent().before(ctx));
  }
}

export class ReadyEvent extends Event {
  constructor() {
    super('ready');
  }

  async after(ctx: EventCallbackContext): Promise<void> {
    const userInfo = await ctx.repository.getUserInfo(ctx.clientId);
    if (!userInfo) {
      ctx.respond(new ErrorEvent({ message: 'unregistered user' }));
      return;
    }

    await ctx.repository.appendReadiedUser(ctx.clientId);
    ctx.broadcast(await new WaitingEvent().before(ctx));
  }
}

export function eventFromMessage(message: string): Event {
  let msgObj: EventMessage;
  try {
    msgObj = JSON.parse(message);
  } catch {
    return new ErrorEvent({ message: 'invalid message' });
  }

  switch (msgObj.event) {
    case 'register':
      return new RegisterEvent(msgObj.payload as RegisterEventPayload);
    case 'ready':
      return new ReadyEvent();
    default:
      return new ErrorEvent({ message: `no such event: ${msgObj.event}` });
  }
}
