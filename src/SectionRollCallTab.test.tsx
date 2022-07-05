import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SectionRollCallTab } from './SectionRollCallTab';

test('renders empty section roll call tab', () => {
  const props = {
    rsvps: [],
  };

  render(<SectionRollCallTab {...props} />);
});

test('renders section roll call tab', async () => {
  const props = {
    rsvps: [
      {
        name: 'Sam',
        section: 'soprano',
        rsvp: 0,
      },
      {
        name: 'Stevie',
        section: 'mezzo-soprano',
        rsvp: 0,
      },
      {
        name: 'Susan',
        section: 'mezzo-soprano',
        rsvp: 0,
      },
    ],
  };

  render(<SectionRollCallTab {...props} />);
  const elts = await screen.findAllByRole('tab');
  expect(elts.length).toBe(3);
  await fireEvent.click(elts[1]);
  let elt = await screen.findByTestId('soprano-section-roll-call-tab');
  await fireEvent.click(elt);
  elt = await screen.findByText(/Sam/);
  expect(elt).toBeDefined();
});
