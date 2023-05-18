import { Subject } from 'rxjs';
import { handleErrorSignOut } from '../App.util';
import { EventCardProps } from '../components/EventCard';

test('signs out on runtime error', async () => {
  let alerted = false;
  global.alert = (msg: string) => {
    alerted = true;
  }

  const config = {
    eventCards: new Subject<Array<EventCardProps>>(),
    listAllEvents: new Subject<boolean>(),
    logout: () => { },
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

