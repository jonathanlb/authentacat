import React, { useState } from 'react';
import './App.css';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Logout from '@mui/icons-material/Logout';
import Search from '@mui/icons-material/Search';

import { EventCard, EventCardProps } from './EventCard';

export type AppProps = {
  getEventsP: Promise<Array<EventCardProps>>;
}

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
          <Box className="AppHeader">
            <a href="https://mnmando.org">
              <img src="logo.png" alt="Minnesota Mandolin Orchestra logo" />
            </a>

            <Typography className="UserNameNotice">Welcome, { user?.attributes?.name } </Typography>
            <Tooltip title="Filter events">
              <TextField className="AppHeaderFilter"
                aria-label="filter events by name or venue"
                label={<Search />}
                id="eventFilterText"
                onChange={e => updateCardVisibility(e.target.value)} />
            </Tooltip>

            <Tooltip title="Logout">
              <Button className="AppHeaderButton" aria-label="logout button" onClick={signOut}><Logout/></Button>
            </Tooltip>
          </Box>
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
