import { useState } from 'react';
import './App.css';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Subject } from 'rxjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import { AppHeader } from './AppHeader';
import { EventCard, EventCardProps } from './EventCard';

export type AppProps = {
  getEventsP: Promise<Array<EventCardProps>>;
}

const eventFilter = new Subject<string>();

function App(props: AppProps) {
  const [ eventConfigs, setEventConfigs ] = useState([] as Array<EventCardProps>);
  props.getEventsP.then(setEventConfigs);

  function updateCardVisibility(filterStr: string) {
    const trimmedFilter = filterStr.trim().toLowerCase();
    eventConfigs.forEach((ec: EventCardProps, i: number) => {
      const elt = document.getElementById(`eventCard_${i}`);
      if (elt != null) {
        if (ec.name.toLowerCase().includes(trimmedFilter) ||
          ec.venue.name.toLowerCase().includes(trimmedFilter)) {
          elt.style['visibility'] = 'visible';
          elt.style['opacity'] = '1';
          elt.style['height'] = '';
        } else {
          elt.style['visibility'] = 'hidden';
          elt.style['opacity'] = '0';
          elt.style['height'] = '0px';
        }
      }
    });
    return true;
  }

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
          { eventConfigs.map((eventConfig: EventCardProps, i: number) =>
                <Box sx={{
                  visibility: "visible",
                  opacity: 1,
                  transition: "visibility 0.3s linear,opacity 0.3s linear"
                  }}
                  id={`eventCard_${i}`}
                  key={eventConfig.name} >
                <EventCard
                  key={eventConfig.name}
                  {...eventConfig}
                />
                </Box>
              )
          }
        </Card>
      )}
    </Authenticator>
  );
}

export default App;
