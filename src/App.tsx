import { useEffect } from 'react';

import './App.css';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Debug from 'debug';
import { BehaviorSubject, Observable } from 'rxjs';

import Card from '@mui/material/Card';

import { handleErrorSignOut } from './App.util';
import { AppHeader } from './components/AppHeader';
import { EventContent } from './components/EventContent';
import { ServerInterface } from './rest/serverInterface';

export type AppProps = {
  config: ServerInterface;
  latestEventFirst: BehaviorSubject<boolean>;
  listAllEvents: BehaviorSubject<boolean>;
}

const errors = Debug('rsvp:App:errors');
const eventFilter = new BehaviorSubject<string>('');

function App(props: AppProps) {
  let unsub = Promise.resolve(() => { });

  useEffect(() => {
    return () => {
      unsub.then(f => f());
    }
  });

  return (
    <Authenticator>
      {({ signOut, user }) => { 
        unsub = handleErrorSignOut(props.config, signOut as () => void); 

        return ( 
          <Card className="App">
            <AppHeader homeHref="https://mnmando.org"
              filter={eventFilter}
              latestEventFirst={props.latestEventFirst}
              listAllEvents={props.listAllEvents}
              logoImageSrc="logo.png"
              logoImageSrcAlt="Minnesota Mandolin Orchestra logo"
              signOut={signOut}
              userName={user?.attributes?.name || '???'} />
            <EventContent
              eventCards={props.config.eventCards}
              filter={eventFilter}
              latestEventFirst={props.latestEventFirst} /> 
          </Card>
        );
      }}
    </Authenticator>
  );
}

export default App;
