import Debug from 'debug';
import { BehaviorSubject } from 'rxjs';

const debug = Debug('rsvp:rsvpReporter');

export type RsvpReporterConfig = {
  serverName: string;
};

/**
 * Behavior to retrieve and report the user's rsvps for events.
 */
export class RsvpReporter {
  accessToken: string;
  rsvps: Map<number, BehaviorSubject<number>>;
  eventQueries: Map<number, Map<number, BehaviorSubject<number>>>;
  serverName: string;

  constructor(config: RsvpReporterConfig) {
    this.accessToken = '';
    this.rsvps = new Map();
    this.eventQueries = new Map();
    this.serverName = config.serverName;
  }

  /** 
   * Get the user's previous RSVPs for the event from the server.
   */
  getRsvp(eventId: number, dtId: number): BehaviorSubject<number> {
    let rsvp = this.rsvps.get(dtId);
    if (rsvp !== undefined) {
      return rsvp;
    }

    let query = this.eventQueries.get(eventId);
    if (query !== undefined) {
      rsvp = query.get(dtId);
      if (rsvp == undefined) {
        rsvp = new BehaviorSubject(0);
        this.rsvps.set(dtId, rsvp);
      }
      return rsvp;
    }
    rsvp = new BehaviorSubject(0);
    this.rsvps.set(dtId, rsvp);
    query = new Map();
    query.set(dtId, rsvp);
    this.eventQueries.set(eventId, query);

    // wire up change to push user's response to server
    rsvp.subscribe(x => {
      const url = `${this.serverName}/event/rsvp/${eventId}/${dtId}/${x}`;
      debug('rsvpPush', url);
      fetch(url, this.fetchOpts()); 
    });

    const url = `${this.serverName}/event/rsvp/${eventId}`;
    debug('getEventRsvp', url);
    fetch(url, this.fetchOpts())
      .then(resp => {
        if (resp.status !== 200) {
          throw new Error(`Cannot rsvp to server: ${resp.status} ${resp.statusText}`);
        }     
        return resp.json();
      })
      .then(dtXr => {
        // inform others of the rsvp downloaded
        debug('gotEventRsvp', dtXr);
        Object.entries(dtXr).forEach(kv => {
          const id = Number(kv[0]);
          const r = kv[1] as number;
          let s = query?.get(id);
          if (s == undefined) {
            query?.set(id, new BehaviorSubject(r));
          } else {
            s.next(r);
          }
        });
      }); 

    return rsvp;
  }

  private fetchOpts(): any {
    return {
      headers: {
        authorization: this.accessToken,
      },
    };
  }
}
