import { useEffect } from 'react';

import './App.css';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { BehaviorSubject } from 'rxjs';

import Card from '@mui/material/Card';

import { handleErrorSignOut } from './App.util';
import { AppHeader } from './components/AppHeader';
import { EventContent } from './components/EventContent';
import { ServerInterface } from './rest/serverInterface';

export type AppProps = {
  config: ServerInterface;
  latestEventFirst: BehaviorSubject<boolean>;
  listAllEvents: BehaviorSubject<boolean>;
  showRideShare?: boolean;
}

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

        const userName = user?.attributes?.name || '???';

        return ( 
          <Card className="App">
            <AppHeader homeHref="https://mnmando.org"
              filter={eventFilter}
              latestEventFirst={props.latestEventFirst}
              listAllEvents={props.listAllEvents}
              logoImageSrc="logo.png"
              logoImageSrcAlt="Minnesota Mandolin Orchestra logo"
              signOut={signOut}
              userName={userName} />
            <EventContent
              eventCards={props.config.eventCards}
              filter={eventFilter}
              latestEventFirst={props.latestEventFirst}
              showRideShare={props.showRideShare}
              userName={userName} /> 
          </Card>
        );
      }}
    </Authenticator>
  );
}

export default App;
