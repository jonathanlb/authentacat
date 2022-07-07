export type RestClientConfig = {
  accessToken?: string;
  serverName: string;
}

export class RestClient {
  accessToken: string;
  serverName: string;

  constructor(config: RestClientConfig) {
    this.accessToken = config.accessToken || '';
    this.serverName = config.serverName;
  }

  fetchOpts(): any {
    return {
      headers: {
        authorization: this.accessToken,
      },
    };
  }
}
