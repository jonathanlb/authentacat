import React from 'react';
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

const venue = {
  name: 'Bob\'s Big Tent',
  address: '1234 Some Place, Anytown'
};

const eventConfigs = [
  {
    descriptionMd: 'We\'ll perform all the **greatest** hits and misses of the Orangatan Oboe Orchestra.\n\nBring your own snacks.',
    name: 'The Festivalissimo!',
    venue,
    dateTimes: [
      { hhmm: '16:15',
        yyyymmdd: '2022-05-13',
        duration: '60m',
        rsvp: 0,
        rsvpCount: { yes: 5, no: 3, maybe: 1 },
      },
      { hhmm: '15:15',
        yyyymmdd: '2022-05-14',
        duration: '60m',
        rsvp: 1,
        rsvpCount: { yes: 1, no: 1, maybe: 1 },
      },
    ],
  },
  {
    descriptionMd: 'More **greatest** hits and misses?\n\nBring snacks for the audience.',
    name: 'A Rerun',
    venue,
    dateTimes: [
      { hhmm: '17:00',
        yyyymmdd: '2022-06-04',
        duration: '60m',
        rsvp: -1,
        rsvpCount: { yes: 1, no: 2, maybe: 0 },
      },
      { hhmm: '18:00',
        yyyymmdd: '2022-06-05',
        duration: '60m',
        rsvp: -1,
        rsvpCount: { yes: 0, no: 10, maybe: 0 },
      },
    ],
  }
];

function App() {
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
                  name={eventConfig.name}
                  descriptionMd={eventConfig.descriptionMd}
                  venue={eventConfig.venue}
                  dateTimes={eventConfig.dateTimes}
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
