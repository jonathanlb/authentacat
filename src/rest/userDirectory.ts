import Debug from 'debug';
import { RestClient } from './restClient';

const debug = Debug('rsvp:user');

export type UserDirectoryConfig = {
  accessToken?: string;
  serverName: string;
}

export type UserInfo = {
  editor?: number,
  email: string,
  name: string,
  organizer?: number,
  section: string,
};

export class UserDirectory extends RestClient {
  userInfo: Map<number, Promise<UserInfo>>;

  constructor(config: UserDirectoryConfig) {
    super(config);
    this.userInfo = new Map();
  }

  async getUserInfo(id: number): Promise<UserInfo> {
    let u = this.userInfo.get(id);
    if (u === undefined) {
      u = new Promise<UserInfo>((resolve, reject) => {
        const url = `${this.serverName}/user/get/${id}`;
        this.fetchJson(url)
          .then(j => {
            debug('fetched', id, j);
            resolve({
              editor: j.editor,
              email: j.email,
              name: j.name,
              organizer: j.organizer,
              section: j.section });
          })
          .catch(e => reject(e));
      });
      this.userInfo.set(id, u);
    }
    return u;
  }
}
