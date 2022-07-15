import { ServerImpl, ServerInterface } from './rest/serverInterface';

const config = {
  serverName: 'http://192.168.1.22:8989',
};

export function newConfig(): ServerInterface {
  return new ServerImpl(config);
}
