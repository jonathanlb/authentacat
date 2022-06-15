import './App.css';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { ReplaySubject } from 'rxjs';

import Card from '@mui/material/Card';

import { AppHeader } from './AppHeader';
import { EventCardProps } from './EventCard';
import { EventContent } from './EventContent';

export type AppProps = {
  getEventsP: Promise<Array<EventCardProps>>;
}

const eventFilter = new ReplaySubject<string>(1);
const eventCards = new ReplaySubject<Array<EventCardProps>>(1);

function App(props: AppProps) {
  props.getEventsP.then(data => eventCards.next(data));
 
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Card className="App">
          <AppHeader homeHref="https://mnmando.org"
            filter={eventFilter}
            logoImageSrc="logo.png"
            logoImageSrcAlt="Minnesota Mandolin Orchestra logo"
            signOut={signOut}
            userName={user?.attributes?.name || '???'} />
          <EventContent eventCards={eventCards} filter={eventFilter} /> 
        </Card>
      )}
    </Authenticator>
  );
}

export default App;
