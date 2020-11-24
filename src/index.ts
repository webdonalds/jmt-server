import crypto from 'crypto';
import { createServer, IncomingMessage } from 'http';
import { Socket } from 'net';
import WebSocket, { Server } from 'ws';
import { eventFromMessage, Event, JoinedEvent } from './events';
import { Repository } from './repository';
import { SocketService } from './services';

const socketService = new SocketService();
const repository = new Repository();

const server = createServer();
const wss = new Server({ noServer: true });

server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
  let clientId = req.headers['X-Client-Id'] as string;
  const firstJoin = !clientId;
  if (firstJoin) {
    clientId = crypto.randomBytes(20).toString('hex');
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    socketService.register(clientId, ws);
    if (firstJoin) {
      socketService.publishEvent(clientId, new JoinedEvent({ token: clientId }));
    }

    wss.emit('connection', ws, req, clientId);
  });
});

wss.on('connection', (ws: WebSocket, _: IncomingMessage, clientId: string) => {
  ws.on('close', () => { socketService.unregister(clientId); });
  ws.on('message', async (data: string) => {
    const event = eventFromMessage(data);
    await event.after({
      clientId,
      repository,
      broadcast: (resp: Event) => { socketService.broadcastEvent(resp); },
      respond: (resp: Event) => { socketService.publishEvent(clientId, resp); },
    });
  });
});

server.listen(process.env.PORT || 8080);
