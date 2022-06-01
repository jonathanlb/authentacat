import { tallyBySection } from './aggregate';

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
