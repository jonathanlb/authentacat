// Unit tests source Amplify stuff that breaks testing....
//
import Debug from 'debug';

import { ServerInterface } from './rest/serverInterface';

const errors = Debug('rsvp:App:errors');

// TODO: interpret error for user.  Sign in again, versus server error
export function handleErrorSignOut(
  config: ServerInterface,
  signOut: () => void)
: Promise<() => void> {

  function errorSignOut(signOut: () => void, err: any) {
    errors('handleErrorSignOut', err.message, err);
    const errMsg = err.message || 'unknown';
    window.alert('error: ' + errMsg + '\rLogin again or contact your administrator.');
    signOut();
  }

  return config.start(
    (err: any) => errorSignOut(signOut, err)
    ).catch((err) => {
      errorSignOut(signOut, err)
      return () => errors('cannot start server interface', err);
    });
}

