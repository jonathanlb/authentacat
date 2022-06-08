import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionRollCallTab } from './SectionRollCallTab';

test('renders empty section roll call tab', () => {
  const props = {
    rsvps: [],
  };

  render(<SectionRollCallTab {...props} />);
});

test('renders section roll call tab', () => {
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
});
