import { Observable } from 'rxjs';

import { ServerImpl, ServerInterface } from './rest/serverInterface';

export const config = {
  homeHref: 'https://mnmando.org',
  logoAltTxt: 'Minnesota Mandolin Orchestra logo',
  serverName: 'https://node1.mando.land:3011',
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
