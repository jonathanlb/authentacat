import Debug from 'debug';
import { BehaviorSubject, Observable } from 'rxjs';
import { InterestResponse } from './aggregate';
import { RestClient } from './restClient';
import { UserDirectory } from './userDirectory';

const debug = Debug('rsvp:rsvpCollector');

export type RsvpReportCollectorConfig = {
  accessToken?: string;
  serverName: string;
  userDirectory: UserDirectory;
}

export class RsvpReportCollector extends RestClient {
  eventResponses: Map<number,Observable<Array<InterestResponse>>>;
  userDirectory: UserDirectory;

  constructor(config: RsvpReportCollectorConfig) {
    super(config);
    this.eventResponses = new Map();
    this.userDirectory = config.userDirectory;
  }

  getRsvps(eventId: number): Observable<Array<InterestResponse>> {
    let responses = this.eventResponses.get(eventId);
    if (responses === undefined) {
      responses = new BehaviorSubject([]);
      this.eventResponses.set(eventId, responses);

      const url = `${this.serverName}/event/detail/${eventId}`;
      debug('get details', url);
      this.fetchJson(url)
        .then(async (rsvps) => {
          const arr = [] as Array<InterestResponse>;
          for (const [dt, userRsvps] of Object.entries(rsvps)) {
            const dtId = Number(dt);
            for (const [uid, rsvp] of Object.entries(userRsvps as any)) {
              const userInfo = await this.userDirectory.getUserInfo(Number(uid));
              arr.push({
                dt: dtId,
                name: userInfo.name,
                section: userInfo.section,
                rsvp: Number(rsvp),
              });
            }
          }
          (responses as BehaviorSubject<Array<InterestResponse>>).next(arr);
        });
    }
    return responses as Observable<Array<InterestResponse>>;
  }
}
