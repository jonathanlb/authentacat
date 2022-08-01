import { useState } from 'react';
import Debug from 'debug';
import { BehaviorSubject, Observer } from 'rxjs';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
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
import Settings from '@mui/icons-material/Settings';

import './AppHeader.css';

const debug = Debug('rsvp:AppHeader');

export type AppHeaderProps = {
  filter: Observer<string>;
  homeHref: string;
  latestEventFirst: BehaviorSubject<boolean>;
  listAllEvents: BehaviorSubject<boolean>;
  logoImageSrc: string
  logoImageSrcAlt?: string;
  signOut?: (data: any) => void;
  userName: string;
}

export function AppHeader(props: AppHeaderProps) {
  const [latestEventFirst, setLatestEventFirst ] = useState(
    props.latestEventFirst.getValue());

  const [listAllEvents, setListAllEvents ] = useState(
    props.listAllEvents.getValue());

  function updateLatestEventFirst(e: any) {
    const newValue = e.target.checked;
    debug('updateLatestEventFirst', latestEventFirst, newValue);
    if (newValue !== latestEventFirst) {
      localStorage['latestEventFirst'] = newValue;
      props.latestEventFirst.next(newValue);
      setLatestEventFirst(newValue);
    }
  }

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

      <Accordion 
        disableGutters
        elevation={0}
        sx={{ '&:before': { display: 'none', }}}>
        <AccordionSummary
          expandIcon={<Tooltip title="Show/hide settings"><Settings /></Tooltip>}
          >
        </AccordionSummary> 

        <AccordionDetails> 
          <FormControl>
            <FormControlLabel
              control={
                <Switch checked={listAllEvents }
                  onChange={updateListAllEvents}
                  />
              }
              label={listAllEvents ? 'All events' : 'Active only' }
              />
          </FormControl>

          <FormControl>
            <FormControlLabel
              control={
                <Switch checked={latestEventFirst}
                  onChange={updateLatestEventFirst}
                  />
              }
              label={latestEventFirst ? 'Latest first' : 'Oldest first' }
              />
          </FormControl>

          <FormControl>
            <FormControlLabel label="Logout"
              control={
                <Button className="AppHeaderButton" 
                  aria-label="logout button"
                  onClick={props.signOut}>
                  <Logout/>
                </Button>
              }
            />
          </FormControl>
        </AccordionDetails> 
      </Accordion>
    </Box>
  );
}
