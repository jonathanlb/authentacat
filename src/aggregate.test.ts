import { groupBy, tallyBySection } from './aggregate';

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

  expect(groupBy(lst, 'key')).
    toEqual(new Map([
      ['a', [ { key: 'a', value: 1 }, { key: 'a', value: 2 }]],
      ['b', [ { key: 'b', value: 3 }]],
    ]));
});


test('tallies empty responses', () => {
  expect(tallyBySection([])).toEqual([]);
});

test('tallies responses from one section', () => {
  const rsvps = [
    { name: 'Adlai', section: 'alto', rsvp: 1 },
    { name: 'Alice', section: 'alto', rsvp: 1 },
    { name: 'Ann', section: 'alto', rsvp: 1 },
    { name: 'Apu', section: 'alto', rsvp: 0 },
    { name: 'Arnie', section: 'alto', rsvp: 0 },
    { name: 'Astro', section: 'alto', rsvp: -1 },
  ];
  const tally = tallyBySection(rsvps);
  expect(tally).toEqual([{
    section: 'alto',
    affirmatives: 3,
    maybes: 2,
    negatives: 1,
  }]);
});
