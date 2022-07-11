import { RsvpReporter } from './rsvpReporter';

import { ERR_400, OK_200, jsonResult } from './restClient.testutil';

const EID = 11;
const DID = 21;
const DID1 = 22;

test('rsvpReporter fetches', done => {
  global.fetch = (url: RequestInfo, _opts?: RequestInit | undefined) => {
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

  const r = new RsvpReporter({ serverName: 'example.com' });
  const rsvp = r.getRsvp(EID, DID);

  let count = 0;
  rsvp.subscribe(r => {
    count += 1;
    expect(r).toEqual(1);
    if (count >= 2) { done(); }
  });

  const rsvp0 = r.getRsvp(EID, DID);
  expect(rsvp0).toEqual(rsvp);

  const rsvp2 = r.getRsvp(EID, DID1);
  rsvp2.subscribe(r => {
    count += 1;
    expect(r).toEqual(-1);
    if (count >= 2) { done(); }
  });

  r.release();
}, 1500);
