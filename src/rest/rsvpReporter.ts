import Debug from 'debug';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { RestClient } from './restClient';

const debug = Debug('rsvp:rsvpReporter');

export type RsvpReporterConfig = {
  accessToken?: string;
  serverName: string;
};

/**
 * Store pairs of subjects used forward updates from the client (to subscribers
 * and server) and from the server (excludes the server listening for changes),
 * respectively.
 */
type RsvpPair = {
  clientUpdates: BehaviorSubject<number>;
  serverUpdates: Subject<number>;
}

/**
 * Behavior to retrieve and report the user's rsvps for events.
 */
export class RsvpReporter extends RestClient {
  rsvps: Map<number, RsvpPair>;
  rsvpSub: Array<Subscription>;

  constructor(config: RsvpReporterConfig) {
    super(config);
    this.rsvpSub = [];
    this.rsvps = new Map();
  }

  /** Clean up after use, say if the instance is used inside a component that unmounts. */
  release() {
    this.rsvpSub.forEach(i => i.unsubscribe());
  }

  /** 
   * Get the user's previous RSVPs for the event from the server.
   */
  getRsvp(eventId: number, dtId: number): BehaviorSubject<number> {
    let rsvp = this.rsvps.get(dtId);
    if (rsvp !== undefined) {
      debug('getRsvp', eventId, dtId);
      return rsvp.clientUpdates;
    }

    rsvp = this.wireUserResponseToServer(eventId, dtId, 0);

    const url = `${this.serverName}/event/rsvp/${eventId}`;
    debug('getEventRsvp', url);
    this.fetchJson(url)
      .then(dtXr => {
        // inform others of the rsvp downloaded
        debug('gotEventRsvp', dtXr);
        Object.entries(dtXr).forEach(kv => {
          const dtIdFromServer = Number(kv[0]);
          const r = kv[1] as number;
          let s = this.rsvps.get(dtIdFromServer);
          if (s === undefined) {
            s = this.wireUserResponseToServer(eventId, dtIdFromServer, r);
          }
          debug('next', eventId, dtIdFromServer, r);
          s.serverUpdates.next(r);  // do not to inform server from here
        });
      }); // XXX catch error
    return rsvp.clientUpdates;
  }

  /**
   * Create a new Subject that pushes a user's RSVP response to server tied
   * to a subject that we use to push updates from the server around this app.
   * 
   * @param dtId date time id
   * @param response rsvp value from -1/0/1
   * @returns A memoized subject pair that can be used to send changes to the 
   *   server and just to client subscribers, respectively.
   */
  wireUserResponseToServer(eventId: number, dtId: number, response: number): RsvpPair {
    debug('wire', eventId, dtId, response);
    const serverUpdates = new Subject<number>(); 
    const clientUpdates = new BehaviorSubject(response);

    // Hack keeps some state here to allow filtering of values to prevent
    // updates from server bouncing back:
    //
    // Forward all updates from serverUpdates to clientUpdates so that widgets 
    // can redraw, etc.
    // Save the last value seen-from or pushed-to the server to avoid redundant
    // updates. 
    let valueAtServer: number | undefined;
    let sub = serverUpdates.subscribe(r  => {
      debug('wired', valueAtServer, r);
      valueAtServer = r;
      clientUpdates.next(r);
    });
    this.rsvpSub.push(sub)
    
    sub = clientUpdates.pipe(skip(1)).subscribe(x => { // avoid initial default/dummy value from Behavior init.
      debug('wire check', valueAtServer, x);
      if (x !== valueAtServer) {
        const url = `${this.serverName}/event/rsvp/${eventId}/${dtId}/${x}`;
        debug('rsvpPush', url);
        this.fetch(url); // XXX catch error
        valueAtServer = x;
      }
    });
    this.rsvpSub.push(sub);
    
    const rsvp = { clientUpdates, serverUpdates };
    this.rsvps.set(dtId, rsvp);
    return rsvp;
  }
}
