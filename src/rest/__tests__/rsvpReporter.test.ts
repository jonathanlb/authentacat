import Debug from 'debug';

import { RsvpReporter } from '../rsvpReporter';

import { ERR_400, OK_200, jsonResult } from '../restClient.testutil';

const debug = Debug('rsvp:rsvpReporter');

const EID = 11;
const DID = 21;
const DID1 = 22;

test('rsvpReporter fetches', done => {
  global.fetch = (url: RequestInfo | URL, _opts?: RequestInit | undefined) => {
    let m = url.toString().match(/\/event\/rsvp\/11\/21\/([0-9-]+)$/);
    if (m && m.length === 2) {
      return OK_200;
    }

    m = url.toString().match(/\/event\/rsvp\/11$/);
    if (!m || m.length !== 1) {
      return ERR_400;
    }
    return jsonResult({
      21: 1,
      22: -1,
    });
  }

  const reporter = new RsvpReporter({ serverName: 'example.com' });
  const rsvp = reporter.getRsvp(EID, DID);

  let count = 0;
  rsvp.subscribe(r => {
    debug('subscribe to DID:', r)
    if (r === 1) {
      count += 1;
    }
    if (count === 2) {
      reporter.release();
      done();
    }
  });

  const rsvp0 = reporter.getRsvp(EID, DID);
  expect(rsvp0).toEqual(rsvp);

  const rsvp2 = reporter.getRsvp(EID, DID1);
  rsvp2.subscribe(r => {
    debug('subscribe to DID1:', r)
    if (r === -1) {
      count += 1;
    }
    if (count === 2) {
      reporter.release();
      done();
    }
  });
}, 1500);
