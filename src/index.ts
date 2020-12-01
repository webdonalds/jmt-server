import crypto from 'crypto';
import WebSocket, { Server } from 'ws';
import {
  eventFromMessage, Event, ConnectEventPayload, ConnectedEvent, ErrorEvent,
} from './events';
import { Repository } from './repository';
import { SocketService } from './services';

const socketService = new SocketService();
const repository = new Repository();

const wss = new Server({ port: parseInt(process.env.PORT || '8080', 10) });

function handleConnection(clientId: string, ws: WebSocket): void {
  ws.on('close', () => { socketService.unregister(clientId); });
  ws.on('message', async (data: string) => {
    const clientEvent = eventFromMessage(data);
    await clientEvent.after({
      clientId,
      repository,
      broadcast: (resp: Event) => { socketService.broadcastEvent(resp); },
      respond: (resp: Event) => { socketService.publishEvent(clientId, resp); },
    });
  });

  socketService.register(clientId, ws);
  socketService.publishEvent(clientId, new ConnectedEvent({ token: clientId }));
}

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: string) => {
    const event = eventFromMessage(data);
    if (event.eventType !== 'connect') {
      ws.send(new ErrorEvent({ message: 'unauthenticated socket' }).toMessage());
      ws.close();
      return;
    }

    ws.removeAllListeners('message');

    const clientId = (event.payload as ConnectEventPayload).token || crypto.randomBytes(20).toString('hex');
    handleConnection(clientId, ws);
  });
});
