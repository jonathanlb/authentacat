import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppHeader } from '../AppHeader';
import { BehaviorSubject, Subject } from 'rxjs';

test('app header renders', () => {
  const filter = new Subject<string>();
  const props = {
    filter: filter,
    homeHref: 'https://example.com',
    latestEventFirst: new BehaviorSubject(true),
    listAllEvents: new BehaviorSubject(false),
    logoImageSrc: 'imgs/logo.png',
    logoImageSrcAlt: 'logo goes here',
    signOut: (_data: any) => { },
    userName: 'Francisca Gonzaga',
  };

  render(<AppHeader {...props}/>);
  const nameElt = screen.getByText(new RegExp(`.*Welcome, ${props.userName}.*`));
  expect(nameElt).toBeInTheDocument();
});

test('app header forwards along filter events', done => {
  const filter = new Subject<string>();
  const filterText = 'abc';
  filter.subscribe(txt => { 
    expect(txt).toEqual(filterText);
    done(); 
  });

  const props = {
    filter: filter,
    homeHref: 'https://example.com',
    latestEventFirst: new BehaviorSubject(true),
    listAllEvents: new BehaviorSubject(false),
    logoImageSrc: 'imgs/logo.png',
    signOut: (_data: any) => { },
    userName: 'Francisca Gonzaga',
  };

  render(<AppHeader {...props}/>);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: filterText }});
}, 1500);

