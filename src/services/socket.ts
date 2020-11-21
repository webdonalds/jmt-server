import WebSocket from 'ws';

import { Event } from '../events';
import logger from '../logger';

export class SocketService {
  private sockets = new Map<string, WebSocket>();

  register(clientId: string, socket: WebSocket): void {
    logger.info(`socket registered: ${clientId}`);
    this.sockets.set(clientId, socket);
  }

  unregister(clientId: string): void {
    logger.info(`socket unregistered: ${clientId}`);
    this.sockets.delete(clientId);
  }

  publishEvent(socketId: string, event: Event): void {
    this.sockets.get(socketId)?.send(event.toMessage());
  }

  broadcastEvent(event: Event): void {
    const message = event.toMessage();
    this.sockets.forEach((socket) => { socket.send(message); });
  }
}
