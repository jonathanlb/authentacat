import { Auth } from '@aws-amplify/auth';

import Debug from 'debug';
import { Observable, ReplaySubject } from 'rxjs';

import { InterestResponse } from './aggregate';
import { DateTimeInterestProps } from './DateTimeInterest';
import { EventCardProps } from './EventCard';
import { VenueCardProps } from './VenueCard';

const debug = Debug('rsvp:control');

export type ServerImplOpts = {
  serverName: string;
}

export type ServerInterface = {
  eventCards: Observable<Array<EventCardProps>>;

  start: () => Promise<void>;
};

export class ServerImpl {
  accessToken: string;
  eventCards: ReplaySubject<Array<EventCardProps>>;
  serverName: string;
  venues: Map<number, VenueCardProps>;

  constructor(config: ServerImplOpts) {
    this.accessToken = '';
    this.eventCards = new ReplaySubject(1);
    this.serverName = config.serverName;
    this.venues = new Map();
  }

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
    const dts = await this.getEventTally(
      eventDesc.dateTime ? [ eventDesc.dateTime ] : eventDesc.dateTimes);
      const eventCard = {
        descriptionMd: eventDesc.description,
        name: eventDesc.name,
        venue: await this.getVenue(eventDesc.venue),
        dateTimes: dts,
        interestResponse: await this.getInterestResponses(dts.map(dt => dt.id)),
      };
        debug('completed event card', eventDesc.id);
        return Promise.resolve(eventCard);
  }

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

  /** XXX TODO */
  private getEventTally(dts: Array<any>): Promise<Array<DateTimeInterestProps>> {
    debug('getEventTally', dts);
    const result = dts.map(dt => {
      return {
        id: dt.id,
        hhmm: dt.hhmm,
        yyyymmdd: dt.yyyymmdd,
        duration: dt.duration,
        rsvp: 0,
        rsvpCount: {
          yes: 0,
          no: 0,
          maybe: 1,
        },
      };        
    }) as Array<DateTimeInterestProps>;
    return Promise.resolve(result);
  }

  /** XXX TODO */
  private async getInterestResponses(dts: Array<number>): Promise<Observable<Array<InterestResponse>>> {
    return Promise.resolve(new ReplaySubject<Array<InterestResponse>>(1));
  } // XXX
 
  /** XXX TODO */
  async getVenue(venueId: number): Promise<VenueCardProps> {
    if (!this.venues.has(venueId)) {
      const url = `${this.serverName}/venue/get/${venueId}`;
      debug('getVenue', url);
      const response = await fetch(url, this.fetchOpts()); 
      if (response.status !== 200) {
        return Promise.reject(new Error(`status: ${response.status}`));
      }
      const venue = await response.json();
      this.venues.set(venueId, {
        address: venue.address,
        name: venue.name,
      });
    }
    return Promise.resolve(this.venues.get(venueId) as VenueCardProps);
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
    const ids = await this.getEventIds();
    const result = await Promise.all<EventCardProps>(
      ids.map((id: number) => this.eventId2CardProp(id))); // XXX catch error
    this.eventCards.next(result);
    debug(`pushed ${result.length} event cards`);
    return Promise.resolve();
  }
}
