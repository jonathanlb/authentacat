import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionTotalsTab } from './SectionTotalsTab';

test('renders empty section totals tab', () => {
  const props = {
    rsvps: []
  };

  render(<SectionTotalsTab {...props} />);
});

test('renders section totals tab', () => {
  const props = {
    rsvps: [{
      name: 'Bob',
      section: 'bass',
      rsvp: 0,
    },
    {
      name: 'Tabby',
      section: 'tenor',
      rsvp: -1,
    },
    {
      name: 'Theodore',
      section: 'tenor',
      rsvp: 1,
    },
  ]};

  render(<SectionTotalsTab {...props} />);
});
