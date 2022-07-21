import { handleErrorSignOut } from '../App.util';

test('signs out on runtime error', async () => {
  let alerted = false;
  global.alert = (msg: string) => {
    alerted = true;
  }

  const config = {
    start: (stopOnError: (err: any) => void) => {
      stopOnError(new Error('simulating error'));
      return Promise.resolve(() => {});
    },
  };

  let signedOut = false;
  const signOut = () => {
    signedOut = true;
  }

  const f = await handleErrorSignOut(config, signOut);
  expect(alerted).toBe(true);
  expect(signedOut).toBe(true);
  f();
});

test('signs out on cleanup error', async () => {
  let alerted = false;
  let signedOut = false;

  global.alert = (msg: string) => {
    alerted = true;
  }

  const config = {
    start: (stopOnError: (err: any) => void) => {
      return Promise.reject(new Error('unsubscribe error'));
    },
  };

  const signOut = () => {
    signedOut = true;
  }

  const f = await handleErrorSignOut(config, signOut);
  f();
  expect(alerted).toBe(true);
  expect(signedOut).toBe(true);
});
