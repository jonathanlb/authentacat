import { useState } from 'react';
import Debug from 'debug';
import { BehaviorSubject, Observer } from 'rxjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Logout from '@mui/icons-material/Logout';
import Search from '@mui/icons-material/Search';

import './AppHeader.css';

const debug = Debug('rsvp:AppHeader');

export type AppHeaderProps = {
  filter: Observer<string>;
  homeHref: string;
  listAllEvents: BehaviorSubject<boolean>;
  logoImageSrc: string
  logoImageSrcAlt?: string;
  signOut?: (data: any) => void;
  userName: string;
}

export function AppHeader(props: AppHeaderProps) {
  const [listAllEvents, setListAllEvents ] = useState(
    props.listAllEvents.getValue());

  function updateListAllEvents(e: any) {
    const newValue = e.target.checked;
    debug('updateListAllEvents', listAllEvents, newValue);
    if (newValue !== listAllEvents) {
      localStorage['listAllEvents'] = newValue;
      props.listAllEvents.next(newValue);
      setListAllEvents(newValue);
    }
  }

  return (
    <Box className="AppHeader">
      <a href={props.homeHref}>
        <img src={props.logoImageSrc} alt={props.logoImageSrcAlt || "logo" } />
      </a>

      <Typography className="UserNameNotice">
        Welcome, { props.userName }
      </Typography>

      <Tooltip title="Filter events">
        <TextField className="AppHeaderFilter"
          aria-label="filter events by name or venue"
          label={<Search />}
          id="eventFilterText"
          onChange={ e => props.filter.next(e.target.value) } />
      </Tooltip>

      <Box sx={{ margin: '3%', padding: '1%', border: '1px solid grey', borderRadius: '5px', display: 'flex', flexDirection: 'column' }}>
        <Tooltip title="Logout">
          <Button className="AppHeaderButton" 
            aria-label="logout button"
            onClick={props.signOut}>
            <Logout/>
          </Button>
        </Tooltip>

        <FormControl>
          <FormControlLabel
            control={
              <Switch checked={listAllEvents }
                onChange={updateListAllEvents}
                />
            }
            label={listAllEvents ? 'All events' : 'Active events' }
            />
        </FormControl>
      </Box>

    </Box>
  );
}
