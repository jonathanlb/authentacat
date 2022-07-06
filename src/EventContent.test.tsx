import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';
import { Subject } from 'rxjs';

import { InterestResponse } from './aggregate';
import { EventCardProps } from './EventCard';
import { EventContent } from './EventContent';

const venue = {
  name: 'The break room',
  address: 'The Batcave',
};

test('event content renders', () => {
  const cards = new Subject<Array<EventCardProps>>();

  const props = {
    eventCards: cards,
    filter: new Subject<string>(),
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

  const props = {
    eventCards: cards,
    filter: filter,
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
  expect(() => screen.getByTestId('eventCard_0')).toThrow();

  act(() => {
    filter.next(venue.name);
  });
  elt = screen.getByTestId('eventCard_0');
  expect(elt).toBeVisible();
});
