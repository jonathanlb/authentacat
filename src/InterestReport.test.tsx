import React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { render, screen, waitFor } from '@testing-library/react';
import { InterestReport } from './InterestReport';

let container: any;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

test('renders empty responses', async () => {
  const props = {
    time: 'Fri, May 13, 2022 4:15 pm (60m)',
    hideF: () => {},
    getResponsesP: Promise.resolve([ ]),
  };

  act(() => {
    ReactDOM.createRoot(container).render(<InterestReport {...props}/>);
  });
  await waitFor( () => {
    const elt = screen.getByText(props.time);
    expect(elt).toBeInTheDocument();
  });
});

test('renders two sections of responses', async () => {
  const props = {
    time: 'Fri, May 13, 2022 4:15 pm (60m)',
    hideF: () => {},
    getResponsesP: Promise.resolve([
      { name: 'Bill', section: 'Bass', rsvp: 0 },
      { name: 'Bob', section: 'Bass', rsvp: 1 },
      { name: 'Steve', section: 'Soprano', rsvp: -1 },
      { name: 'Sue', section: 'Soprano', rsvp: 1 },
    ]),
  };

  act(() => {
    ReactDOM.createRoot(container).render(<InterestReport {...props}/>);
  });
  await waitFor( () => {
    const elt = screen.getByText(/Steve/);
    expect(elt).toBeInTheDocument();
  });
});
