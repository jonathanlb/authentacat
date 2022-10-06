import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { InterestResponse, summarizeResponses } from './aggregate';
import { EventCardProps } from './components/EventCard';
import { RideShare } from './rideShare';
import { ServerInterface } from './rest/serverInterface';

import Debug from 'debug';

const debug = Debug('rsvp:control:demo');

const venues = [
  {
    name: 'Bob\'s Big Tent',
    address: '1234 Some Place, Anytown'
  },
  {
    name: 'The Grotto',
    address: '112 Boogey Woogey Ave, Overthere'
  },
];

const interestResponses = [
  [ // 0
    { dt: 1,
      name: 'Adam',
      email: 'adam@example.com',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 1,
      name: 'Alvin',
      email: 'alvin@example.com',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 1,
      name: 'Arnie',
      email: 'arnie@example.com',
      section: 'Alto',
      rsvp: 0,
    },
    { dt: 1,
      name: 'Beth',
      email: 'beth@example.com',
      section: 'Bass',
      rsvp: -1,
    },
    { dt: 1,
      name: 'Carlos',
      email: 'carlos@example.com',
      section: 'Conductor',
      rsvp: 1,
    },
    { dt: 1,
      name: 'Susan',
      email: 'susan@example.com',
      section: 'Soprano',
      rsvp: 1,
    },
    { dt: 1,
      name: 'Ted',
      email: 'ted@example.com',
      section: 'Tenor',
      rsvp: 1,
    },
    { dt: 1,
      name: 'Theodore',
      email: 'theodore@example.com',
      section: 'Tenor',
      rsvp: 0,
    },
  ],
  [ // 1
    { dt: 2,
      name: 'Adam',
      email: 'adam@example.com',
      section: 'Alto',
      rsvp: -1,
    },
    { dt: 2,
      name: 'Alvin',
      email: 'alvin@example.com',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 2,
      name: 'Arnie',
      email: 'arnie@example.com',
      section: 'Alto',
      rsvp: 0,
    },
    { dt: 2,
      name: 'Beth',
      email: 'beth@example.com',
      section: 'Bass',
      rsvp: 1,
    },
    { dt: 2,
      name: 'Carlos',
      email: 'carlos@example.com',
      section: 'Conductor',
      rsvp: 1,
    },
    { dt: 2,
      name: 'Susan',
      email: 'susan@example.com',
      section: 'Soprano',
      rsvp: 1,
    },
    { dt: 2,
      name: 'Ted',
      email: 'ted@example.com',
      section: 'Tenor',
      rsvp: 1,
    },
    { dt: 2,
      name: 'Theodore',
      email: 'theodore@example.com',
      section: 'Tenor',
      rsvp: 1,
    },
  ],
  [ // 2
    { dt: 3,
      name: 'Adam',
      email: 'adam@example.com',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 3,
      name: 'Alvin',
      email: 'alvin@example.com',
      section: 'Alto',
      rsvp: 0,
    },
    { dt: 3,
      name: 'Arnie',
      email: 'arnie@example.com',
      section: 'Alto',
      rsvp: -1,
    },
    { dt: 3,
      name: 'Carlos',
      email: 'carlos@example.com',
      section: 'Conductor',
      rsvp: 1,
    },
    { dt: 3,
      name: 'Susan',
      email: 'susan@example.com',
      section: 'Soprano',
      rsvp: 1,
    },
    { dt: 3,
      name: 'Theodore',
      email: 'theodore@example.com',
      section: 'Tenor',
      rsvp: 0,
    },
  ],
  [ // 3
    { dt: 4,
      name: 'Adam',
      email: 'adam@example.com',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 4,
      name: 'Alvin',
      email: 'alvin@example.com',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 4,
      name: 'Arnie',
      email: 'arnie@example.com',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 4,
      name: 'Beth',
      email: 'beth@example.com',
      section: 'Bass',
      rsvp: 0,
    },
    { dt: 4,
      name: 'Carlos',
      email: 'carlos@example.com',
      section: 'Conductor',
      rsvp: -1,
    },
    { dt: 4,
      name: 'Susan',
      email: 'susan@example.com',
      section: 'Soprano',
      rsvp: 1,
    },
    { dt: 4,
      name: 'Ted',
      email: 'ted@example.com',
      section: 'Tenor',
      rsvp: 0,
    },
    { dt: 4,
      name: 'Theodore',
      email: 'theodore@example.com',
      section: 'Tenor',
      rsvp: 0,
    },
  ],
];

const rideShares = [
  [
    {
      name: 'Alvin',
      neighborhood: 'Uptown',
      provideRide: false,
    },
    {
      name: 'Susan',
      neighborhood: 'Uptown',
      provideRide: true,
    },
    {
      name: 'Ted',
      neighborhood: 'The Other Side of the Tracks',
      provideRide: false,
    },
  ],
  [],
];

/** Return all the responses, the event cards will partitition them by dtId. */
function getInterestResponse(): Observable<Array<InterestResponse>> {
  const res = new BehaviorSubject([] as Array<InterestResponse>);
  res.next(
    interestResponses[0].concat(
      interestResponses[1], interestResponses[2], interestResponses[3]));
  return res;
}

const events: Array<EventCardProps> = [
  {
    expressRideShare: new Subject(),
    descriptionMd: 'We\'ll perform all the **greatest** hits and misses of the Orangatan Oboe Orchestra.\n\nBring your own snacks.',
    name: 'The Festivalissimo!',
    venue: venues[0],
    dateTimes: [
      { id: 1,
        hhmm: '16:15',
        yyyymmdd: '2022-05-13',
        duration: '60m',
        rsvp: new BehaviorSubject(0),
        rsvpCount: new BehaviorSubject(summarizeResponses(interestResponses[0])),
      },
      { id: 2,
        hhmm: '15:15',
        yyyymmdd: '2022-05-14',
        duration: '60m',
        rsvp: new BehaviorSubject(1),
        rsvpCount: new BehaviorSubject(summarizeResponses(interestResponses[1])),
      },
    ],
    interestResponse: getInterestResponse(),
    rideShares: new BehaviorSubject(rideShares[0]),
  },
  {
    expressRideShare: new Subject(),
    descriptionMd: 'More **greatest** hits and misses?\n\nBring snacks for the audience.',
    name: 'A Rerun',
    venue: venues[1],
    dateTimes: [
      { id: 3,
        hhmm: '17:00',
        yyyymmdd: '2022-06-04',
        duration: '60m',
        rsvp: new BehaviorSubject(-1),
        rsvpCount: new BehaviorSubject(summarizeResponses(interestResponses[2])),
      },
      { id: 4,
        hhmm: '18:00',
        yyyymmdd: '2022-06-05',
        duration: '60m',
        rsvp: new BehaviorSubject(-1),
        rsvpCount: new BehaviorSubject(summarizeResponses(interestResponses[3])),
      },
    ],
    interestResponse: getInterestResponse(),
    rideShares: new BehaviorSubject(rideShares[1]),
  }
];

events.forEach(e => {
  e.expressRideShare.subscribe(rs => {
    const name = 'You';
    rs.name = name;
    const rss = (e.rideShares as BehaviorSubject<Array<RideShare>>).getValue().filter(r => r.name !== name);
    if (rs.neighborhood) {
      rss.push(rs);
    }
    (e.rideShares as BehaviorSubject<Array<RideShare>>).next(rss);
  })
})

export function newDemoConfig(): ServerInterface {
  const eventCards = new BehaviorSubject([] as Array<EventCardProps>);
  const listAllEvents = new BehaviorSubject(false);

  return {
    eventCards,
    listAllEvents,
    start: (stopOnError: (err: any) => void) => {
      try {
        debug('start');
        eventCards.next(events);
      } catch (err) {
        stopOnError(err);
      }
      return Promise.resolve(() => debug('stopping'));
    },
  };
}
