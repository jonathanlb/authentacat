import React from 'react';
import { render, screen } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { InterestResponse } from '../../aggregate';
import { InterestReport } from '../InterestReport';

let container: any;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

test('renders empty responses', () => {
  const props = {
    time: 'Fri, May 13, 2022 4:15 pm (60m)',
    hideF: () => {},
    responses: new BehaviorSubject([] as Array<InterestResponse>),
  };

  render(<InterestReport {...props}/>);
  const elt = screen.getByText(props.time);
  expect(elt).toBeInTheDocument();
});

test('renders two sections of responses', () => {
  const responses = new BehaviorSubject([] as Array<InterestResponse>);
  responses.next([
      { dt: 11, name: 'Bill', section: 'Bass', rsvp: 0 },
      { dt: 11, name: 'Bob', section: 'Bass', rsvp: 1 },
      { dt: 11, name: 'Steve', section: 'Soprano', rsvp: -1 },
      { dt: 11, name: 'Sue', section: 'Soprano', rsvp: 1 },
  ]);
  const props = {
    time: 'Fri, May 13, 2022 4:15 pm (60m)',
    hideF: () => {},
    responses,
  };

  render(<InterestReport {...props}/>);
  const elt = screen.getByText(/Steve/);
  expect(elt).toBeInTheDocument();
});
