import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { RideShareCard } from '../RideShareCard';
import { RideShare } from '../../rideShare';
import { BehaviorSubject, Subject } from 'rxjs';

test('empty ride share card renders without driver list', () => {
  const rideShares = new BehaviorSubject<Array<RideShare>>([]);
  const props = {
    name: 'Bobo the Clown',
    neighborhood: 'The Big Tent',
    provideRide: false,
    rideShares: rideShares,
  };

  render(<RideShareCard {...props}/>);
  const carpoolLabel = screen.getByText(new RegExp(`.*Carpooling.*`));
  expect(carpoolLabel).toBeInTheDocument();

  let thrown = false;
  try {
    screen.getByText(new RegExp(`.*Drivers.*`));
  } catch (e) {
    thrown = true;
  }
  expect(thrown).toBe(true);
});

test('ride share card updates', () => {
  const rideShares = new BehaviorSubject<Array<RideShare>>([]);
  const props = {
    name: 'Bobo the Clown',
    provideRide: false,
    rideShares: rideShares,
  };
  const neighborhood = 'The Big Tent';

  render(<RideShareCard {...props}/>);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: neighborhood }});
  const button = screen.getByRole('button', { name: /submit rideshare info/i });
  fireEvent.click(button);
  const textBox = screen.getByText(new RegExp(`.*${neighborhood}.*`));
  expect(textBox).toBeInTheDocument();
  // TODO make sure rideShares has been published and child listing rendered....
  // not trivial?
});

