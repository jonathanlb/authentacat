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
    window.alert('error message: ' + errMsg +
      '\r\rPlease refresh the page and login again. ' +
      'If the problem persists, contact your administrator to report the error message above.');
    signOut();
  }

  return config.start(
    (err: any) => errorSignOut(signOut, err)
    ).catch((err) => {
      return () => errors('cannot start server interface', err);
    });
}

