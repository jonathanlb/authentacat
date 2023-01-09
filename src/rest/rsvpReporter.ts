import Debug from 'debug';
import { BehaviorSubject, Observable, Observer, Subject, Subscription } from 'rxjs';
import { RestClient } from './restClient';

const debug = Debug('rsvp:rsvpReporter');

export type RsvpReporterConfig = {
  accessToken?: string;
  serverName: string;
};

/**
 * Behavior to retrieve and report the user's rsvps for events.
 */
export class RsvpReporter extends RestClient {
  /** 
   * DateTime to BehaviorSubject used by clients to send rsvp changes. 
   */
  clientSends: Map<number, Subject<number>>;

  /** 
   * DateTime to BehaviorSubject used by clients to receive rsvp changes. 
   * We use BehaviorSubjects to ensure that there is always one event to replay
   * upon new subscription.
   */
  clientUpdates: Map<number, BehaviorSubject<number>>;
  rsvpSub: Array<Subscription>;

  constructor(config: RsvpReporterConfig) {
    super(config);
    this.rsvpSub = [];
    this.clientSends = new Map();
    this.clientUpdates = new Map();
  }

  /** Clean up after use, say if the instance is used inside a component that unmounts. */
  release() {
    this.rsvpSub.forEach(i => i.unsubscribe());
  }

  /** 
   * Get the user's previous RSVPs for the event from the server.
   * TODO: expose refresh.
   */
  getRsvp(eventId: number, dtId: number): Observable<number> {
    let rsvp = this.clientUpdates.get(dtId);
    if (!rsvp) {
      rsvp = new BehaviorSubject(0);
      this.clientUpdates.set(dtId, rsvp);

      const url = `${this.serverName}/event/rsvp/${eventId}`;
      debug('getEventRsvp', url);
      this.fetchJson(url).then(dtXr => {
        // inform others of the rsvp downloaded
        debug('gotEventRsvp', dtXr);
        Object.entries(dtXr).forEach(kv => {
          const dtIdFromServer = Number(kv[0]);
          const r = kv[1] as number;
          let s = this.clientUpdates.get(dtIdFromServer);

          debug('next', eventId, dtIdFromServer, r);
          if (s === undefined) {
            s = new BehaviorSubject(r);
            this.clientUpdates.set(dtIdFromServer, s);
          } else {
            s.next(r);
          }
        });
      });
    }
    return rsvp as Subject<number>;
  }

  /**
   * Get a channel to send update to the server and other listeners.
   */
  sendRsvp(eventId: number, dtId: number): Observer<number> {
    let out = this.clientSends.get(dtId);
    if (!out) {
      out = new Subject();
      this.clientSends.set(dtId, out);
      out.subscribe((rsvp: number) => {
        const url = `${this.serverName}/event/rsvp/${eventId}/${dtId}/${rsvp}`;
        debug('rsvpPush', url);
        this.fetch(url);

        // propogate the event back to any local subscribers.
        (this.getRsvp(eventId, dtId) as BehaviorSubject<number>).next(rsvp);
      });
    }
    return out as Subject<number>
  }
}
