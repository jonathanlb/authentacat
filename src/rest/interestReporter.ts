import Debug from 'debug';
import { BehaviorSubject, Observable } from 'rxjs';

import { RestClient } from './restClient';
import { RsvpCount } from '../aggregate';

const debug = Debug('rsvp:interst');
const errors = Debug('rsvp:interst:error');

export type InterestReporterOpts = {
  accessToken?: string;
  serverName: string;
};

export class InterestReporter extends RestClient {
  /** DateTimeId to rsvp tally notifications. */
  rsvpCounts: Map<number, BehaviorSubject<RsvpCount>>;

  /** EventId to rsvp tally notifications. */
  rsvpCountQueries: Map<number, Map<number, BehaviorSubject<RsvpCount>>>;

  constructor(config: InterestReporterOpts) {
    super(config);
    this.rsvpCounts = new Map();
    this.rsvpCountQueries = new Map();
  }

  /**
   * Retrieve the aggregate rsvp count for the dateTime, scheduling the retrieval of other
   * dateTimes of the same event.
   */
  getDateTimeInterestCount(eventId: number, dtId: number): Observable<RsvpCount> {
    let dtic = this.rsvpCounts.get(dtId);
    if (dtic !== undefined) {
      return dtic;
    }
    dtic = new BehaviorSubject({yes: 0, no: 0, maybe: 0});
    this.rsvpCounts.set(dtId, dtic);

    let counts = this.rsvpCountQueries.get(eventId);
    if (counts !== undefined) {
      counts.set(dtId, dtic);
      return dtic;
    }

    counts = new Map();
    counts.set(dtId, dtic);
    this.rsvpCountQueries.set(eventId, counts);

    const url = `${this.serverName}/event/summary/${eventId}`;
    this.fetchJson(url)
      .then(obj => { // dateTime -> 0/1 -> count
        debug('rsvps count', obj);
        Object.entries(obj).forEach(kv => {
          const id = Number(kv[0]);
          const tally = kv[1] as any;
          const rsvpCount = { yes: tally['1'], no: tally['-1'], maybe: tally['0']};
          debug('rsvp count', id, rsvpCount);
          
          let rsvpCountSubject = counts?.get(id);
          if (rsvpCountSubject === undefined) {
            rsvpCountSubject = new BehaviorSubject(rsvpCount);
            counts?.set(id, rsvpCountSubject);
          } else {
            rsvpCountSubject.next(rsvpCount);
          }
        });
      });
    return dtic;
  }
}
