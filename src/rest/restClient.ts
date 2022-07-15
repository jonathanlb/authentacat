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

  async fetch(url: string): Promise<any> {
    return fetch(url, this.fetchOpts())
  }

  async fetchJson(url: string): Promise<any> {
    return this.fetch(url)
      .then(resp => {
        if (resp.status !== 200) {
          throw new Error(`Cannot access ${url}: ${resp.status} "${resp.statusText}"`);
        }
        return resp.json();
      });
  }

  fetchOpts(): any {
    return {
      headers: {
        authorization: this.accessToken,
      },
    };
  }
}
