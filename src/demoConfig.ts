import { BehaviorSubject, Observable } from 'rxjs';

import { InterestResponse, summarizeResponses } from './aggregate';
import { EventCardProps } from './components/EventCard';
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
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 1,
      name: 'Alvin',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 1,
      name: 'Arnie',
      section: 'Alto',
      rsvp: 0,
    },
    { dt: 1,
      name: 'Beth',
      section: 'Bass',
      rsvp: -1,
    },
    { dt: 1,
      name: 'Carlos',
      section: 'Conductor',
      rsvp: 1,
    },
    { dt: 1,
      name: 'Susan',
      section: 'Soprano',
      rsvp: 1,
    },
    { dt: 1,
      name: 'Ted',
      section: 'Tenor',
      rsvp: 1,
    },
    { dt: 1,
      name: 'Theodore',
      section: 'Tenor',
      rsvp: 0,
    },
  ],
  [ // 1
    { dt: 2,
      name: 'Adam',
      section: 'Alto',
      rsvp: -1,
    },
    { dt: 2,
      name: 'Alvin',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 2,
      name: 'Arnie',
      section: 'Alto',
      rsvp: 0,
    },
    { dt: 2,
      name: 'Beth',
      section: 'Bass',
      rsvp: 1,
    },
    { dt: 2,
      name: 'Carlos',
      section: 'Conductor',
      rsvp: 1,
    },
    { dt: 2,
      name: 'Susan',
      section: 'Soprano',
      rsvp: 1,
    },
    { dt: 2,
      name: 'Ted',
      section: 'Tenor',
      rsvp: 1,
    },
    { dt: 2,
      name: 'Theodore',
      section: 'Tenor',
      rsvp: 1,
    },
  ],
  [ // 2
    { dt: 3,
      name: 'Adam',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 3,
      name: 'Alvin',
      section: 'Alto',
      rsvp: 0,
    },
    { dt: 3,
      name: 'Arnie',
      section: 'Alto',
      rsvp: -1,
    },
    { dt: 3,
      name: 'Carlos',
      section: 'Conductor',
      rsvp: 1,
    },
    { dt: 3,
      name: 'Susan',
      section: 'Soprano',
      rsvp: 1,
    },
    { dt: 3,
      name: 'Theodore',
      section: 'Tenor',
      rsvp: 0,
    },
  ],
  [ // 3
    { dt: 4,
      name: 'Adam',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 4,
      name: 'Alvin',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 4,
      name: 'Arnie',
      section: 'Alto',
      rsvp: 1,
    },
    { dt: 4,
      name: 'Beth',
      section: 'Bass',
      rsvp: 0,
    },
    { dt: 4,
      name: 'Carlos',
      section: 'Conductor',
      rsvp: -1,
    },
    { dt: 4,
      name: 'Susan',
      section: 'Soprano',
      rsvp: 1,
    },
    { dt: 4,
      name: 'Ted',
      section: 'Tenor',
      rsvp: 0,
    },
    { dt: 4,
      name: 'Theodore',
      section: 'Tenor',
      rsvp: 0,
    },
  ],
];

function getInterestResponse(id: number): Observable<Array<InterestResponse>> {
  const res = new BehaviorSubject([] as Array<InterestResponse>);
  res.next(interestResponses[id-1]);
  return res;
}

const events: Array<EventCardProps> = [
  {
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
    interestResponse: getInterestResponse(1),
  },
  {
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
    interestResponse: getInterestResponse(2),
  }
];

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
