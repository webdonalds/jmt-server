import redis from 'redis';
import { promisify } from 'util';

const client = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
});

export class PromisifiedRedisClient {
  hget: (key: string, field: string) => Promise<string> = promisify(client.hget).bind(client);

  hgetall: (key: string) => Promise<{ [field: string]: string }> = promisify(client.hgetall).bind(client);

  hset: (key: string, field: string, value: string) => Promise<number> = promisify(client.hset).bind(client);

  lrange: (key: string, from: number, to: number) => Promise<string[]> = promisify(client.lrange).bind(client);

  rpush: (key: string, value: string) => Promise<number> = promisify(client.rpush).bind(client);
}
