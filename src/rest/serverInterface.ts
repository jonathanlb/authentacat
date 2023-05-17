import { Auth } from '@aws-amplify/auth';

import Debug from 'debug';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { DateTimeInterestProps } from '../components/DateTimeInterest';
import { EventCardProps } from '../components/EventCard';
import { EventEditor } from './eventEditor';
import { lastYear, today } from '../dateTime';
import { InterestReporter } from './interestReporter';
import { RestClient } from './restClient';
import { RsvpReportCollector } from './rsvpReportCollector';
import { RsvpReporter } from './rsvpReporter';
import { VenueCardProps } from '../components/VenueCard';
import { UserDirectory } from './userDirectory';
import { RideShareReporter } from './ridesShareReporter';

const debug = Debug('rsvp:control');
const errors = Debug('rsvp:control:error');

export type ServerImplOpts = {
  accessToken?: string;
  listAllEvents: Observable<boolean>;
  serverName: string;
}

export type ServerInterface = {
  eventCards: Observable<Array<EventCardProps>>;
  listAllEvents: Observable<boolean>;

  start: (stopOnError: (err: any) => void) => Promise<() => void>; // return a cleanup function
  passwordless?: boolean; // for demo config only
};

/**
 * Provide an interface to the back-end server for RSVP queries and posts.
 */
export class ServerImpl extends RestClient {
  eventCards: BehaviorSubject<Array<EventCardProps>>;
  eventEditor: EventEditor;
  getICal: Subject<number>;
  interestReporter: InterestReporter;
  listAllEvents: Observable<boolean>;
  rideShareReporter: RideShareReporter;
  rsvpCollector: RsvpReportCollector;
  rsvpReporter: RsvpReporter;
  stopped: boolean;
  userDirectory: UserDirectory;
  venues: Map<number, Promise<VenueCardProps>>;

  constructor(config: ServerImplOpts) {
    super(config);
    this.eventCards = new BehaviorSubject([] as Array<EventCardProps>);
    this.eventEditor = new EventEditor(config);
    this.userDirectory = new UserDirectory(config);
    this.interestReporter = new InterestReporter(config);
    this.listAllEvents = config.listAllEvents;
    this.rideShareReporter = new RideShareReporter({
      serverName: this.serverName,
    });
    this.rsvpCollector = new RsvpReportCollector({
      serverName: this.serverName,
      userDirectory: this.userDirectory,
    });
    this.rsvpReporter = new RsvpReporter(config);
    this.stopped = false;
    this.venues = new Map();

    this.getICal = new Subject<number>();
    this.getICal.subscribe(dtId => this.downloadICal(dtId)); // XXX clean up.
    debug('init');
  }

  /**
   * Logic to download event calendar/ics files to embed into front-end
   * widgets.
   *
   * @param dtId the dateTime id representing the timeslot and event to
   * populate calendar event wiht.
   */
  private async downloadICal(dtId: number) {
    const errf = (msg: string) => {
      window.alert(`Cannot download ical event: ${msg}`);
      return true;
    }

    const url = `${this.serverName}/event/ical/${dtId}`;
    debug(url);
    try {
      const resp = await this.fetch(url);
      if (resp.status !== 200) {
        errf(`Cannot access ${url}: ${resp.status} "${resp.statusText}"`);
      }
      const handle = window.open('data:text/calendar;charset=utf8,' + encodeURIComponent(await resp.text()));
      if (!handle) {
        errf('Cannot save ical event data');
      } else {
        handle.onerror = errf as OnErrorEventHandler;
      }
    } catch (e) {
      errf((e as any).message)
    }
  }

  /**
   * Query the server to populate the event card properties.
   */
  private async eventId2CardProp(eventId: number): Promise<EventCardProps> {
    const url = `${this.serverName}/event/get/${eventId}`;
    debug('eventId2CardProp', url);
    const eventDesc = await this.fetchJson(url);
    debug('event description', eventDesc);
    const dts = this.getEventTally(
      eventDesc.dateTime ? [eventDesc.dateTime] : eventDesc.dateTimes);
    const editable = eventDesc.editable;
    const eventCard = {
      editable: editable,
      expressRideShare: this.rideShareReporter.setRideShares(eventId),
      descriptionEdits: editable ? this.eventEditor.getEventEditor(eventId) : new Subject<string>(),
      descriptionMd: eventDesc.description,
      name: eventDesc.name,
      venue: await this.getVenue(eventDesc.venue),
      dateTimes: dts,
      getICal: this.getICal,
      interestResponse: this.rsvpCollector.getRsvps(eventId),
      rideShares: this.rideShareReporter.getRideShares(eventId),
    };
    debug('completed event card', eventDesc.id);
    return Promise.resolve(eventCard);
  }

  /**
   * Retrieve all of the available event id numbers.
   */
  private async getEventIds(listAllEvents: boolean): Promise<Array<number>> {
    const url = listAllEvents ?
      `${this.serverName}/event/listafter/${lastYear()}` : // arbitrary limit on events
      `${this.serverName}/event/listafter/${today()}`;
    debug('getEventIds', url);
    const eventIds = await this.fetchJson(url);
    debug('eventIds', eventIds);
    return eventIds;
  }

  private getEventTally(dts: Array<any>): Array<DateTimeInterestProps> {
    debug('getEventTally', dts);
    return dts.map(dt => {
      return {
        id: dt.id,
        hhmm: dt.hhmm,
        yyyymmdd: dt.yyyymmdd,
        duration: dt.duration,
        readRsvp: this.rsvpReporter.getRsvp(dt.event, dt.id),
        rsvp: this.rsvpReporter.sendRsvp(dt.event, dt.id),
        rsvpCount: this.interestReporter.getDateTimeInterestCount(dt.event, dt.id),
      };
    }) as Array<DateTimeInterestProps>;
  }

  async getVenue(venueId: number): Promise<VenueCardProps> {
    if (!this.venues.has(venueId)) {
      const p = new Promise<VenueCardProps>(async (resolve, reject) => {
        const url = `${this.serverName}/venue/get/${venueId}`;
        debug('getVenue', url);
        const jsonResp = await this.fetchJson(url);
        resolve({ address: jsonResp.address, name: jsonResp.name });
      });
      this.venues.set(venueId, p);
    } else {
      debug('hit venue', venueId);
    }
    return this.venues.get(venueId) as Promise<VenueCardProps>;
  }

  async start(stopOnError: (err: any) => void): Promise<() => void> {
    this.stopped = false;
    const session = await Auth.currentSession();
    this.accessToken = session.getIdToken().getJwtToken();
    this.eventEditor.accessToken = this.accessToken;
    this.interestReporter.accessToken = this.accessToken;
    this.rideShareReporter.accessToken = this.accessToken;
    this.rsvpCollector.accessToken = this.accessToken;
    this.rsvpReporter.accessToken = this.accessToken;
    this.userDirectory.accessToken = this.accessToken;

    const listAllSub = this.listAllEvents.subscribe(
      async (listAllEvents: boolean) => {
        try {
          const ids = await this.getEventIds(listAllEvents);
          const result = await Promise.all<EventCardProps>(
            ids.map((id: number) => this.eventId2CardProp(id))); // XXX catch error
          this.eventCards.next(result);
          debug(`pushed ${result.length} event cards`);
        } catch (err: any) {
          errors('cannot fetch events', err);
          errors(err.message);
          listAllSub.unsubscribe();
          // try to limit alerting user... still alerts x2...
          if (!this.stopped) {
            this.stopped = true;
            stopOnError(err);
          }
        }
      }
    );

    return () => listAllSub.unsubscribe();
  }
}
