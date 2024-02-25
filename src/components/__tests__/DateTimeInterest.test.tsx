import { fireEvent, render, screen } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import '../mockSlider';
import { DateTimeInterest, extractEventDates, extractEventLocation, extractEventTitle } from '../DateTimeInterest';

test('date time interest renders', () => {
  const props = {
    id: 23,
    hhmm: '21:15',
    yyyymmdd: '2022-07-09',
    duration: '93m',
    getICal: (_: number) => Promise.resolve('XXX'),
    readRsvp: new BehaviorSubject(0),
    rsvp: new BehaviorSubject(0),
    rsvpCount: new BehaviorSubject({ yes: 11, no: 9, maybe: 7 }),
  };
  render(<DateTimeInterest {...props} />);
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
    getICal: (_: number) => Promise.resolve('XXX'),
    readRsvp: rsvp,
    rsvp: rsvp,
    rsvpCount: new BehaviorSubject({ yes: 11, no: 9, maybe: 7 }),
  };
  render(<DateTimeInterest {...props} />);

  const elt = screen.getByTestId('date-time-interest-slider-23');
  fireEvent.change(elt, { target: { value: -1 } });
}, 1500);

test('date time interest forwards count updates', () => {
  const rsvp = new BehaviorSubject(0);
  const rsvpCount = new BehaviorSubject({ yes: 11, no: 9, maybe: 7 });

  const props = {
    id: 23,
    hhmm: '21:15',
    yyyymmdd: '2022-07-09',
    duration: '93m',
    getICal: (_: number) => Promise.resolve('XXX'),
    readRsvp: rsvp,
    rsvp: rsvp,
    rsvpCount: rsvpCount,
  };
  render(<DateTimeInterest {...props} />);

  let elt = screen.getByText(/11/);
  expect(elt).toBeVisible();

  elt = screen.getByTestId('date-time-interest-slider-23');
  fireEvent.change(elt, { target: { value: 1 } });
  elt = screen.getByText(/12/);
  expect(elt).toBeVisible();
});

const DUMMY_ICAL_ENTRY = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//sebbo.net//ical-generator//EN
BEGIN:VEVENT
UID:63344a18-0757-4f60-adc8-5cabc22ce136
SEQUENCE:0
DTSTAMP:20240221T202812Z
DTSTART;TZID=America/Chicago:20240325T183000
DTEND;TZID=America/Chicago:20240325T193000
SUMMARY:Lexington Landing Spring \'24
LOCATION:Lexington Landing\\n900 Old Lexington Ave S\, Saint Paul
DESCRIPTION:OK\, this is a Spring performance for real\, at least if you subscribe to [astronomical calendars](https://www.ncei.noaa.gov/news/meteorological-versus-astronomical-seasons).  Samantha has invited us to perform for the residents at Lexington Landing\, a new venue for us.
ORGANIZER;CN="Minnesota Mandolin Orchestra":mailto:jonathanb@minnesotamandolinorchestra.org
URL;VALUE=URI:https://rsvp.mmo.mando.land
END:VEVENT
END:VCALENDAR`;

test('extracts event title from ical', () => {
  const title = extractEventTitle(DUMMY_ICAL_ENTRY)
  expect(title).toEqual(
    encodeURIComponent(
      'Lexington Landing Spring \'24'
    ));
});

test('extracts event dates from ical', () => {
  const dates = extractEventDates(DUMMY_ICAL_ENTRY)
  expect(dates).toEqual(
    '20240325T183000Z6/20240325T193000Z6'
  );
});

test('extracts event location from ical', () => {
  const location = extractEventLocation(DUMMY_ICAL_ENTRY)
  expect(location).toEqual(
    encodeURIComponent(
      'Lexington Landing, 900 Old Lexington Ave S, Saint Paul'
  ));
});