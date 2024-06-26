import { fireEvent, render, screen } from '@testing-library/react';
import { BehaviorSubject, Subject } from 'rxjs';

import { InterestResponse } from '../../aggregate';
import { EventCard, mapDateTimesToResponses } from '../EventCard';
import { RideShare } from '../../rideShare';

const venue = {
  name: 'Birdland',
  address: '315 W. 44th St.',
};

test('event card renders', () => {
  const rsvp = new BehaviorSubject(0);

  const dateTimes = [{
    id: 19,
    hhmm: '20:15',
    yyyymmdd: '2022-07-01',
    duration: '91m',
    readRsvp: rsvp,
    rsvp: rsvp,
    rsvpCount: new BehaviorSubject({yes: 11, no: 9, maybe: 7}),
  }];

  const props = {
    descriptionEdits: new Subject<string>(),
    descriptionMd: '# Huzzah\n\nMuch ceremony',
    editable: true,
    expressRideShare: new Subject<RideShare>(),
    name: 'Testing Coverage Gala',
    venue: venue,
    dateTimes: dateTimes,
    interestResponse: new Subject<Array<InterestResponse>>(),
    rideShares: new Subject<Array<RideShare>>(),
  };

  render(<EventCard {...props}/>);
});

test('event card shows interest report', async () => {
  const rsvp = new BehaviorSubject(0);
  const dateTimes = [{
    id: 19,
    hhmm: '20:15',
    yyyymmdd: '2022-07-01',
    duration: '91m',
    readRsvp: rsvp,
    rsvp: rsvp,
    rsvpCount: new BehaviorSubject({yes: 11, no: 9, maybe: 7}),
  }];

  const props = {
    descriptionEdits: new Subject<string>(),
    descriptionMd: '# Huzzah\n\nMuch ceremony',
    editable: false,
    expressRideShare: new Subject<RideShare>(),
    name: 'Testing Coverage Gala',
    venue: venue,
    dateTimes: dateTimes,
    interestResponse: new Subject<Array<InterestResponse>>(),
    showAdmin: true,
    rideShares: new Subject<Array<RideShare>>(),
  };

  render(<EventCard {...props}/>);
  let button = screen.getByTestId('show-rsvp-details-19');
  await fireEvent.click(button);
  button = screen.getByTestId('CloseIcon');
  expect(button).toBeDefined();
});

test('event card hides interest report', async () => {
  const rsvp = new BehaviorSubject(0);

  const dateTimes = [{
    id: 19,
    hhmm: '20:15',
    yyyymmdd: '2022-07-01',
    duration: '91m',
    readRsvp: rsvp,
    rsvp: rsvp,
    rsvpCount: new BehaviorSubject({yes: 11, no: 9, maybe: 7}),
  }];

  const props = {
    descriptionEdits: new Subject<string>(),
    descriptionMd: '# Huzzah\n\nMuch ceremony',
    editable: false,
    expressRideShare: new Subject<RideShare>(),
    name: 'Testing Coverage Gala',
    venue: venue,
    dateTimes: dateTimes,
    interestResponse: new Subject<Array<InterestResponse>>(),
    showAdmin: true,
    rideShares: new Subject<Array<RideShare>>(),
  };

  render(<EventCard {...props}/>);
  let button = screen.getByTestId('show-rsvp-details-19');
  await fireEvent.click(button);
  button = screen.getByTestId('CloseIcon');
  await fireEvent.click(button);
  try {
    screen.getByTestId('CloseIcon');
  } catch (e) {
    return;
  }
  throw new Error('expected failure to find the details-report closure');
});

test('separate event interest to dates', done => {
  const rsvps = [ new BehaviorSubject(0), new BehaviorSubject(0)];
  const dts = [
    {
      id: 1, hhmm: '16:00',
      yyyymmdd: '2020-04-20', duration: 'test-1',
      readRsvp: rsvps[0],
      rsvp: rsvps[0],
      rsvpCount: new BehaviorSubject({ yes: 1, no: 1, maybe: 1 }),
    },
    {
      id: 2, hhmm: '18:00',
      yyyymmdd: '2020-04-21', duration: 'test-2',
      readRsvp: rsvps[1],
      rsvp: rsvps[1],
      rsvpCount: new BehaviorSubject({ yes: 2, no: 2, maybe: 2 }),
    },
  ];

  const irs = new Subject<Array<InterestResponse>>();
  const [ dt2ir, sub ] = mapDateTimesToResponses(dts, irs);
  expect(dt2ir.size).toBe(2);

  let count = 0;
  const sub1 = dt2ir.get(1)?.subscribe(ir => {
    expect(ir.length).toBe(1);
    sub1?.unsubscribe();
    count += 1;
    if (count >= 2) {
      done();
    }
  });

  const sub2 = dt2ir.get(2)?.subscribe(ir => {
    expect(ir.length).toBe(2);
    sub2?.unsubscribe();
    count += 1;
    if (count >= 2) {
      done();
    }
  });

  irs.next([
    { dt: 1, email: 'a@b.com', name: 'Alice', section: 'alto', rsvp: 1 },
    { dt: 2, email: 'a@b.com', name: 'Alice', section: 'alto', rsvp: -1 },
    { dt: 2, email: 'b@c.com', name: 'Bob', section: 'baritone', rsvp: -1 },
  ]);

  sub.unsubscribe();
}, 1500);
