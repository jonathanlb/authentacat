import { Observable } from 'rxjs';

import { ServerImpl, ServerInterface } from './rest/serverInterface';

const config = {
  // serverName: 'https://node0.mando.land:3011',
  serverName: 'http://192.168.1.22:8989',
};

export type ConfigOpts = {
  listAllEvents: Observable<boolean>; 
}

export function newConfig(opts: ConfigOpts): ServerInterface {
  const serverConfig = Object.assign(
    { listAllEvents: new Observable<boolean>() },
    config,
    opts);
  return new ServerImpl(serverConfig);
}
