import { Auth } from '@aws-amplify/auth';

import Debug from 'debug'; 
import { Observable, ReplaySubject } from 'rxjs'; 

import { InterestResponse } from './aggregate';
import { DateTimeInterestProps } from './DateTimeInterest';
import { EventCardProps } from './EventCard';
import { ServerInterface } from './serverInterface';
import { VenueCardProps } from './VenueCard';

const debug = Debug('rsvp:control:config');
const config: ServerInterfaceConfig = {
  serverName: 'http://192.168.1.22:8989',
  accessToken: '',
};

export function newConfig(): ServerInterface {
  const eventCards = new ReplaySubject<Array<EventCardProps>>(1);

  return {
    eventCards,
    start: async () => {
      const session = await Auth.currentSession();
      config.accessToken = session.getIdToken().getJwtToken();
      const ids = await getEventIds(config);
      const result = await Promise.all<EventCardProps>(
        ids.map((id: number) => eventId2CardProp(config, id))); // XXX catch error
      eventCards.next(result);
      debug(`pushed ${result.length} event cards`);
      return Promise.resolve();
    },
  };
}

export type ServerInterfaceConfig = {
  accessToken: string;
  serverName: string;
}

/** 
 * Take the array of dateTimes from the server (type [id, eventid, yyyymmdd, hhmm, duration])
 * and add rsvp and rsvpCount to each.
 */
async function getEventTally(
  config: ServerInterfaceConfig,
  dts: Array<any>): Promise<Array<DateTimeInterestProps>> {
  return Promise.resolve([]);
}

async function getInterestResponses(config: ServerInterfaceConfig, dts: Array<number>): Promise<Observable<Array<InterestResponse>>> {
  return Promise.resolve(new ReplaySubject<Array<InterestResponse>>(1));
} // XXX

async function getVenue(config: ServerInterfaceConfig, venueId: number): Promise<VenueCardProps> {
  return Promise.resolve({
    name: 'Bob\'s Big Tent',
    address: '1234 Some Place, Anytown'
  }); // XXX
}

function fetchOpts(c: ServerInterfaceConfig): any {
  return {
    headers: {
      authorization: c.accessToken,
    },
  }
}

export async function eventId2CardProp(config: ServerInterfaceConfig, eventId: number): Promise<EventCardProps> {
  const url = `${config.serverName}/event/get/${eventId}`;
  debug('eventId2CardProp', url);
  const response = await fetch(url, fetchOpts(config)); 
  debug('event/get response', response);
  if (response.status !== 200) {
    return Promise.reject(new Error(`status: ${response.status}`));
  }
  const eventDesc = await response.json();
  debug('event description', eventDesc);
  const dts = await getEventTally(
    config,
    eventDesc.dateTime ? [ eventDesc.dateTime ] : eventDesc.dateTimes);
  const eventCard = {
    descriptionMd: eventDesc.description,
    name: eventDesc.name,
    venue: await getVenue(config, eventDesc.venue),
    dateTimes: dts,
    interestResponse: await getInterestResponses(config, dts.map(dt => dt.id)),
  };
  debug('completed event card', eventDesc.id);
  return Promise.resolve(eventCard);
}

export async function getEventIds(config: ServerInterfaceConfig): Promise<Array<number>> {
  const url = `${config.serverName}/event/list`;
  debug('getEventIds', url);
  const response = await fetch(url, fetchOpts(config)); 
  debug('event/list response', response);
  if (response.status !== 200) {
    return Promise.reject(new Error(`status: ${response.status}`));
  }
  const eventIds = await response.json();
  debug('eventIds', eventIds);
  return eventIds;
}
