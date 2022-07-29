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

  /**
   * Ensure the fetch operation has the proper headers.
   * Unfortunetely, errors thrown here don't always have enough information to 
   * forward along to be properly handled. 
   * For example, if the server rate limits the client.
   * A curl request to the rate-limited server has a message of 
   *   "Too many requests, please try again later."
   * but fetch seems to frequently lose, burying the CORS error.
   */
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
