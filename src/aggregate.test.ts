import { groupBy, summarizeResponses, tallyBySection } from './aggregate';

test('groups empty list', () => {
  expect(groupBy([], 'some-key')).toEqual(new Map());
});


test('groups by a key', () => {
  const lst = [
    {
      key: 'a',
      value: 1,
    },
    {
      key: 'a',
      value: 2,
    },
    {
      key: 'b',
      value: 3,
    },
  ];

  expect(groupBy(lst, 'key'))
    .toEqual(new Map([
      ['a', [ { key: 'a', value: 1 }, { key: 'a', value: 2 }]],
      ['b', [ { key: 'b', value: 3 }]],
    ]));
});

test('summarizes empty response', () => {
  const count = summarizeResponses([]);
  expect(count).toEqual({ yes: 0, no: 0, maybe: 0 });
});

test('summarizes responses', () => {
  const count = summarizeResponses([
    { dt: 11, name: 'Abel', section: 'alto', rsvp: 1 },
    { dt: 11, name: 'Beth', section: 'bass', rsvp: 0 },
    { dt: 11, name: 'Chuck', section: 'contralto', rsvp: 1 },
    { dt: 11, name: 'Fred', section: 'flute', rsvp: -1 },
    { dt: 11, name: 'Gabby', section: 'guitar', rsvp: 1 },
    { dt: 11, name: 'Hera', section: 'harp', rsvp: -1 },
  ]);
  expect(count).toEqual({ yes: 3, no: 2, maybe: 1 });
});

test('tallies empty responses', () => {
  expect(tallyBySection([])).toEqual([]);
});

test('tallies responses from one section', () => {
  const rsvps = [
    { dt: 11, name: 'Adlai', section: 'alto', rsvp: 1 },
    { dt: 11, name: 'Alice', section: 'alto', rsvp: 1 },
    { dt: 11, name: 'Ann', section: 'alto', rsvp: 1 },
    { dt: 11, name: 'Apu', section: 'alto', rsvp: 0 },
    { dt: 11, name: 'Arnie', section: 'alto', rsvp: 0 },
    { dt: 11, name: 'Astro', section: 'alto', rsvp: -1 },
  ];
  const tally = tallyBySection(rsvps);
  expect(tally).toEqual([{
    section: 'alto',
    affirmatives: 3,
    maybes: 2,
    negatives: 1,
  }]);
});
