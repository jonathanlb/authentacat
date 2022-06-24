import { Auth } from '@aws-amplify/auth';

import Debug from 'debug';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

import { InterestResponse, RsvpCount } from './aggregate';
import { DateTimeInterestProps } from './DateTimeInterest';
import { EventCardProps } from './EventCard';
import { InterestReporter } from './interestReporter';
import { RsvpReporter } from './rsvpReporter';
import { VenueCardProps } from './VenueCard';

const debug = Debug('rsvp:control');
const errors = Debug('rsvp:control:error');

export type ServerImplOpts = {
  serverName: string;
}

export type ServerInterface = {
  eventCards: Observable<Array<EventCardProps>>;

  start: () => Promise<void>;
};

/**
 * Provide an interface to the back-end server for RSVP queries and posts.
 */
export class ServerImpl {
  accessToken: string;
  eventCards: ReplaySubject<Array<EventCardProps>>;
  interestReporter: InterestReporter;
  rsvpReporter: RsvpReporter;
  serverName: string;
  venues: Map<number, Promise<VenueCardProps>>;

  constructor(config: ServerImplOpts) {
    this.accessToken = '';
    this.eventCards = new ReplaySubject(1);
    this.interestReporter = new InterestReporter(config);
    this.rsvpReporter = new RsvpReporter(config);
    this.serverName = config.serverName;
    this.venues = new Map();
    debug('init');
  }

  /**
   * Query the server to populate the event card properties.
   */
  private async eventId2CardProp(eventId: number): Promise<EventCardProps> {
    const url = `${this.serverName}/event/get/${eventId}`;
    debug('eventId2CardProp', url);
    const response = await fetch(url, this.fetchOpts()); 
    debug('event/get response', response);
    if (response.status !== 200) {
      return Promise.reject(new Error(`status: ${response.status}`));
    }
    const eventDesc = await response.json();
    debug('event description', eventDesc);
    const dts = this.getEventTally(
      eventDesc.dateTime ? [ eventDesc.dateTime ] : eventDesc.dateTimes);
    const eventCard = {
      descriptionMd: eventDesc.description,
      name: eventDesc.name,
      venue: await this.getVenue(eventDesc.venue),
      dateTimes: dts,
      interestResponse: this.getRsvps(dts.map(dt => dt.id)),
    };
    debug('completed event card', eventDesc.id);
    return Promise.resolve(eventCard);
  }

  /**
   * Retrieve all of the available event id numbers.
   */
  private async getEventIds(): Promise<Array<number>> {
    const url = `${this.serverName}/event/list`;
    debug('getEventIds', url);
    const response = await fetch(url, this.fetchOpts()); 
    debug('event/list response', response);
    if (response.status !== 200) {
      return Promise.reject(new Error(`status: ${response.status}`));
    }
    const eventIds = await response.json();
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

  /** XXX TODO */
  private getRsvps(dts: Array<number>): Observable<Array<InterestResponse>> {
    return new ReplaySubject<Array<InterestResponse>>(1);
  } // XXX
 
  async getVenue(venueId: number): Promise<VenueCardProps> {
    if (!this.venues.has(venueId)) {
      const p = new Promise<VenueCardProps>(async (resolve, reject) => {
        const url = `${this.serverName}/venue/get/${venueId}`;
        debug('getVenue', url);
        const response = await fetch(url, this.fetchOpts()); 
        if (response.status !== 200) {
          reject(new Error(`getVenue status: ${response.status}`));
          return;
        }

        const jsonResp = await response.json();
        resolve({ address: jsonResp.address, name: jsonResp.name });
      });
      this.venues.set(venueId, p);
    } else {
      debug('hit venue', venueId);
    }
    return this.venues.get(venueId) as Promise<VenueCardProps>;
  }

  private fetchOpts(): any {
    return {
      headers: {
        authorization: this.accessToken,
      },
    };
  }

  async start(): Promise<void> {
    const session = await Auth.currentSession();
    this.accessToken = session.getIdToken().getJwtToken();
    this.interestReporter.accessToken = this.accessToken;
    this.rsvpReporter.accessToken = this.accessToken;
    const ids = await this.getEventIds();
    const result = await Promise.all<EventCardProps>(
      ids.map((id: number) => this.eventId2CardProp(id))); // XXX catch error
    this.eventCards.next(result);
    debug(`pushed ${result.length} event cards`);
    return Promise.resolve();
  }
}
