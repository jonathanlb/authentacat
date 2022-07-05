import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { BehaviorSubject, Subject } from 'rxjs';

import { InterestResponse } from './aggregate';
import { EventCard } from './EventCard';

const venue = {
  name: 'Birdland',
  address: '315 W. 44th St.',
};

test('event card renders', () => {
  const dateTimes = [{
    id: 19,
    hhmm: '20:15',
    yyyymmdd: '2022-07-01',
    duration: '91m',
    rsvp: new BehaviorSubject(0),
    rsvpCount: new BehaviorSubject({yes: 11, no: 9, maybe: 7}),
  }];

  const props = {
    descriptionMd: '# Huzzah\n\nMuch ceremony',
    name: 'Testing Coverage Gala',
    venue: venue,
    dateTimes: dateTimes,
    interestResponse: new Subject<Array<InterestResponse>>(),
  };

  render(<EventCard {...props}/>);
});

test('event card shows interest report', async () => {
  const dateTimes = [{
    id: 19,
    hhmm: '20:15',
    yyyymmdd: '2022-07-01',
    duration: '91m',
    rsvp: new BehaviorSubject(0),
    rsvpCount: new BehaviorSubject({yes: 11, no: 9, maybe: 7}),
  }];

  const props = {
    descriptionMd: '# Huzzah\n\nMuch ceremony',
    name: 'Testing Coverage Gala',
    venue: venue,
    dateTimes: dateTimes,
    interestResponse: new Subject<Array<InterestResponse>>(),
    showAdmin: true,
  };

  render(<EventCard {...props}/>);
  let button = screen.getByTestId('show-rsvp-details-19');
  await fireEvent.click(button);
  button = screen.getByTestId('CloseIcon');
  expect(button).toBeDefined();
});

test('event card hides interest report', async () => {
  const dateTimes = [{
    id: 19,
    hhmm: '20:15',
    yyyymmdd: '2022-07-01',
    duration: '91m',
    rsvp: new BehaviorSubject(0),
    rsvpCount: new BehaviorSubject({yes: 11, no: 9, maybe: 7}),
  }];

  const props = {
    descriptionMd: '# Huzzah\n\nMuch ceremony',
    name: 'Testing Coverage Gala',
    venue: venue,
    dateTimes: dateTimes,
    interestResponse: new Subject<Array<InterestResponse>>(),
    showAdmin: true,
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
