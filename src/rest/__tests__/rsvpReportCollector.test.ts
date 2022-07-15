import { RsvpReportCollector } from '../rsvpReportCollector';
import { UserDirectory } from '../userDirectory';

import { ERR_400, jsonResult } from '../restClient.testutil';

const EID = 11;
const DID = 21;
const UID = 31;

test('rsvpReportCollector queries', done => {
  global.fetch = (url: RequestInfo, _opts?: RequestInit | undefined) => {
    const m = url.toString().match(/\/event\/detail\/11$/);
    if (!m || m.length !== 1) {
      return ERR_400;
    }

    const dtrsvp = {} as any;
    const rsvp = {} as any;
    rsvp[UID] = -1;
    dtrsvp[DID] = rsvp
    return jsonResult(dtrsvp);
  };

  const mockUserDirectory = {
    getUserInfo(uid: number|string) {
      if (Number(uid) === UID) {
        return Promise.resolve({
          name: 'Claudia',
          section: 'clarinet',
        });
      } else {
        return Promise.resolve({});
      }
    }
  } as UserDirectory;

  const collector = new RsvpReportCollector({
    serverName: 'example.com',
    userDirectory: mockUserDirectory,
  });
  const rsvps = collector.getRsvps(EID);
  rsvps.subscribe(resp => {
    expect(resp).toEqual([{
      dt: DID,
      name: 'Claudia',
      section: 'clarinet',
      rsvp: -1,
    }]);
    done();
  });
}, 1500);
