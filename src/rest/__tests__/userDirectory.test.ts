import { UserDirectory } from '../userDirectory';

import { ERR_400, jsonResult } from '../restClient.testutil';

const UID = 31;

test('userDirectory fetches user', async () => {
  global.fetch = (url: RequestInfo, _opts?: RequestInit | undefined) => {
    const m = url.toString().match(/\/user\/get\/31$/);
    if (!m || m.length !== 1) {
      return ERR_400;
    }
    return jsonResult({
      name: 'Viola',
      section: 'viola',
    });
  }

  const dir = new UserDirectory({ serverName: 'example.com' });
  const u = await dir.getUserInfo(UID);
  expect(u).toEqual({
    name: 'Viola',
    section: 'viola',
  });

  const u1 = await dir.getUserInfo(UID);
  expect(u1).toBe(u);
});
