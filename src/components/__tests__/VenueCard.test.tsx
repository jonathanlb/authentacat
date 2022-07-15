import React from 'react';
import { render, screen } from '@testing-library/react';
import { VenueCard } from '../VenueCard';

test('renders venue card', () => {
  const props = {
    name: 'Opree Hus',
    address: '1234 Boogie Woogie Avenue',
  };

  render(<VenueCard {...props}/>);
  const nameElt = screen.getByText(props.name);
  expect(nameElt).toBeInTheDocument();

  const addressElt = screen.getByText(props.address);
  expect(addressElt).toBeInTheDocument();
});

