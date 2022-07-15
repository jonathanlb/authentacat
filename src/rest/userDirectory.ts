import Debug from 'debug';
import { RestClient } from './restClient';

const debug = Debug('rsvp:user');

export type UserDirectoryConfig = {
  accessToken?: string;
  serverName: string;
}

export type UserInfo = {
  name: string,
  section: string,
};

export class UserDirectory extends RestClient {
  userInfo: Map<number, UserInfo>;

  constructor(config: UserDirectoryConfig) {
    super(config);
    this.userInfo = new Map();
  }

  async getUserInfo(id: number): Promise<UserInfo> {
    let u = this.userInfo.get(id);
    if (u === undefined) {
      const url = `${this.serverName}/user/get/${id}`;
      const j = await this.fetchJson(url);
      debug('fetched', id, j);
      u = { name: j.name, section: j.section };
      this.userInfo.set(id, u);
    }
    return Promise.resolve(u);
  }
}
