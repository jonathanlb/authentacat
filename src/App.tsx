import './App.css';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Debug from 'debug';
import { BehaviorSubject } from 'rxjs';

import Card from '@mui/material/Card';

import { AppHeader } from './components/AppHeader';
import { EventContent } from './components/EventContent';
import { ServerInterface } from './rest/serverInterface';

export type AppProps = {
  config: ServerInterface;
}

const errors = Debug('App:errors');
const eventFilter = new BehaviorSubject<string>('');

function App(props: AppProps) {
  return (
    <Authenticator>
      {({ signOut, user }) => { 
        props.config.start().catch((e) => {
          errors('cannot start server interface', e);
          if (signOut) { signOut(); }
        });

        return ( 
          <Card className="App">
            <AppHeader homeHref="https://mnmando.org"
              filter={eventFilter}
              logoImageSrc="logo.png"
              logoImageSrcAlt="Minnesota Mandolin Orchestra logo"
              signOut={signOut}
              userName={user?.attributes?.name || '???'} />
            <EventContent eventCards={props.config.eventCards} filter={eventFilter} /> 
          </Card>
        );
      }}
    </Authenticator>
  );
}

export default App;
