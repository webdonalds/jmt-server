import { PromisifiedRedisClient } from './connectors/redis';

type UserInfo = { nickname: string, present: string };

export class Repository {
  private userInfoKey = 'user_info';

  private readiedUserKey = 'readied_user';

  private client = new PromisifiedRedisClient();

  async getUserInfo(clientId: string): Promise<UserInfo> {
    const value = await this.client.hget(this.userInfoKey, clientId);
    return JSON.parse(value);
  }

  async getUserInfoAll(): Promise<{ [clientId: string]: UserInfo }> {
    const result: { [clientId: string]: UserInfo } = {};
    const hash = await this.client.hgetall(this.userInfoKey);
    Object.entries(hash).forEach(([k, v]) => { result[k] = JSON.parse(v); });
    return result;
  }

  async setUserInfo(clientId: string, nickname: string, present: string): Promise<void> {
    await this.client.hset(this.userInfoKey, clientId, JSON.stringify({ nickname, present }));
  }

  async listReadiedClient(): Promise<string[]> {
    return await this.client.lrange(this.readiedUserKey, 0, -1) || [];
  }

  async appendReadiedUser(clientId: string): Promise<void> {
    await this.client.rpush(this.readiedUserKey, clientId);
  }
}
