import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import './mockSlider';
import { DateTimeInterest } from './DateTimeInterest';

test('date time interest renders', () => {
  const props = {
    id: 23,
    hhmm: '21:15',
    yyyymmdd: '2022-07-09',
    duration: '93m',
    rsvp: new BehaviorSubject(0),
    rsvpCount: new BehaviorSubject({ yes: 11, no: 9, maybe: 7 }),
  };
  render(<DateTimeInterest {...props}/>);
});

test('date time interest forwards rsvp updates', (done) => {
  const rsvp = new BehaviorSubject(0);
  rsvp.subscribe(response => {
    expect(response).toEqual(-1);
    done();
  });

  const props = {
    id: 23,
    hhmm: '21:15',
    yyyymmdd: '2022-07-09',
    duration: '93m',
    rsvp: rsvp,
    rsvpCount: new BehaviorSubject({ yes: 11, no: 9, maybe: 7 }),
  };
  render(<DateTimeInterest {...props}/>);
  
  const elt = screen.getByTestId('date-time-interest-slider-23');
  fireEvent.change(elt, { target: { value: -1 }});
}, 1500);

test('date time interest forwards count updates', () => {
  const rsvp = new BehaviorSubject(0);
  const rsvpCount = new BehaviorSubject({ yes: 11, no: 9, maybe: 7 });

  const props = {
    id: 23,
    hhmm: '21:15',
    yyyymmdd: '2022-07-09',
    duration: '93m',
    rsvp: rsvp,
    rsvpCount: rsvpCount,
  };
  render(<DateTimeInterest {...props}/>);
  
  let elt = screen.getByText(/11/);
  expect(elt).toBeVisible();

  elt = screen.getByTestId('date-time-interest-slider-23');
  fireEvent.change(elt, { target: { value: 1 }});
  elt = screen.getByText(/12/);
  expect(elt).toBeVisible();
});
