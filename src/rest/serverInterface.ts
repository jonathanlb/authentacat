import { Auth } from '@aws-amplify/auth';

import Debug from 'debug';
import { BehaviorSubject, Observable } from 'rxjs';

import { DateTimeInterestProps } from '../components/DateTimeInterest';
import { EventCardProps } from '../components/EventCard';
import { lastYear, today } from '../dateTime';
import { InterestReporter } from './interestReporter';
import { RestClient } from './restClient';
import { RsvpReportCollector } from './rsvpReportCollector';
import { RsvpReporter } from './rsvpReporter';
import { VenueCardProps } from '../components/VenueCard';
import { UserDirectory } from './userDirectory';

const debug = Debug('rsvp:control');
// const errors = Debug('rsvp:control:error');

export type ServerImplOpts = {
  accessToken?: string;
  listAllEvents: Observable<boolean>;
  serverName: string;
}

export type ServerInterface = {
  eventCards: Observable<Array<EventCardProps>>;
  listAllEvents: Observable<boolean>;

  start: (stopOnError: (err: any) => void) => Promise<() => void>; // return a cleanup function
};

/**
 * Provide an interface to the back-end server for RSVP queries and posts.
 */
export class ServerImpl extends RestClient {
  eventCards: BehaviorSubject<Array<EventCardProps>>;
  interestReporter: InterestReporter;
  listAllEvents: Observable<boolean>;
  rsvpCollector: RsvpReportCollector;
  rsvpReporter: RsvpReporter;
  stopped: boolean;
  userDirectory: UserDirectory;
  venues: Map<number, Promise<VenueCardProps>>;

  constructor(config: ServerImplOpts) {
    super(config);
    this.eventCards = new BehaviorSubject([] as Array<EventCardProps>);
    this.userDirectory = new UserDirectory(config);
    this.interestReporter = new InterestReporter(config);
    this.listAllEvents = config.listAllEvents;
    this.rsvpCollector = new RsvpReportCollector({
      serverName: this.serverName,
      userDirectory: this.userDirectory,
    });
    this.rsvpReporter = new RsvpReporter(config);
    this.stopped = false;
    this.venues = new Map();
    debug('init');
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
      eventDesc.dateTime ? [ eventDesc.dateTime ] : eventDesc.dateTimes);
    const eventCard = {
      descriptionMd: eventDesc.description,
      name: eventDesc.name,
      venue: await this.getVenue(eventDesc.venue),
      dateTimes: dts,
      interestResponse: this.rsvpCollector.getRsvps(eventId),
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
        rsvp: this.rsvpReporter.getRsvp(dt.event, dt.id),
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
    this.interestReporter.accessToken = this.accessToken;
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
        } catch (err) {
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
