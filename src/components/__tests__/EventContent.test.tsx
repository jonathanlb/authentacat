import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';
import { BehaviorSubject, Subject } from 'rxjs';

import { InterestResponse } from '../../aggregate';
import { EventCardProps } from '../EventCard';
import { EventContent } from '../EventContent';

const venue = {
  name: 'The break room',
  address: 'The Batcave',
};

test('event content renders', () => {
  const cards = new Subject<Array<EventCardProps>>();
  const latestEventFirst = new BehaviorSubject(true);

  const props = {
    eventCards: cards,
    filter: new Subject<string>(),
    latestEventFirst,
  };

  render(<EventContent {...props}/>);
  act(() => {
    cards.next([{
      descriptionMd: 'Just jest it.',
      name: 'Unit Testing Bachinalia',
      venue: venue,
      dateTimes: [],
      interestResponse: new Subject<Array<InterestResponse>>(),
    }]);
  });
  const elt = screen.getByText(/Unit Testing Bachinalia/);
  expect(elt).toBeDefined();
});

test('event content filters', () => {
  const cards = new Subject<Array<EventCardProps>>();
  const filter = new Subject<string>();
  const latestEventFirst = new BehaviorSubject(true);

  const props = {
    eventCards: cards,
    filter: filter,
    latestEventFirst,
  };

  render(<EventContent {...props}/>);
  act(() => {
    cards.next([{
      descriptionMd: 'Just jest it.',
      name: 'Unit Testing Bachinalia',
      venue: venue,
      dateTimes: [],
      interestResponse: new Subject<Array<InterestResponse>>(),
    }]);
  });
  let elt = screen.getByText(/Unit Testing Bachinalia/);
  expect(elt).toBeDefined();

  elt = screen.getByTestId('eventCard_0');
  expect(elt).toBeVisible();

  act(() => {
    filter.next('zzzzzzzzzzzzzzzzzzzzz');
  });
  elt = screen.getByTestId('eventCard_0');
  expect(elt).not.toBeVisible();

  act(() => {
    filter.next(venue.name);
  });
  elt = screen.getByTestId('eventCard_0');
  expect(elt).toBeVisible();
});
