import { InterestReporter } from '../interestReporter';

import { ERR_400, jsonResult } from '../restClient.testutil';

function buildQueryResult() {
  const result = {} as any;
  let dt = {} as any;
  dt['-1'] = 4; dt['0'] = 5; dt['1'] = 6;
  result['12'] = dt;
  dt = {};
  dt['-1'] = 7; dt['0'] = 8; dt['1'] = 9;
  result['13'] = dt;
  return result;
}

test('interestReporter queries', done => {
  const eventId = 11;
  const config = {
    serverName: 'example.com',
  };

  global.fetch = (url: RequestInfo, _opts?: RequestInit | undefined) => {
    const m = url.toString().match(/\/event\/summary\/11$/);
    if (!m || m.length !== 1) {
      return ERR_400;
    }

    return jsonResult(buildQueryResult());
  };

  const ir = new InterestReporter(config);
  const dtir1 = ir.getDateTimeInterestCount(eventId, 12);
  const dtir2 = ir.getDateTimeInterestCount(eventId, 13);

  const dtir11 = ir.getDateTimeInterestCount(eventId, 12);
  expect(dtir11).toBe(dtir1); // this isn't object identity?

  let count = 0;

  dtir1.subscribe(ir => {
    expect(ir).toEqual({ no: 4, maybe: 5, yes: 6 }); 
    count += 1;
    if (count >= 2) { done(); }
  });

  dtir2.subscribe(ir => {
    expect(ir).toEqual({ no: 7, maybe: 8, yes: 9 }); 
    count += 1;
    if (count >= 2) { done(); }
  });
}, 1500);

test('interestReporter queries, server provides extra', done => {
  const eventId = 11;
  const config = {
    serverName: 'example.com',
  };

  global.fetch = (url: RequestInfo, _opts?: RequestInit | undefined) => {
    const m = url.toString().match(/\/event\/summary\/11$/);
    if (!m || m.length !== 1) {
      return ERR_400;
    }

    return Promise.resolve({
      status: 200,
      json: () => Promise.resolve(buildQueryResult()),
    }) as Promise<Response>;
  };

  const ir = new InterestReporter(config);
  const dtir1 = ir.getDateTimeInterestCount(eventId, 12);

  dtir1.subscribe(ir => {
    expect(ir).toEqual({ no: 4, maybe: 5, yes: 6 }); 
    done();
  });
}, 1500);

