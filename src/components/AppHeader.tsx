import { useState } from 'react';
import Debug from 'debug';
import { BehaviorSubject, Observer } from 'rxjs';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
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

const SETTINGS_POPOVER_ID = 'settings-popover';

export function AppHeader(props: AppHeaderProps) {
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLButtonElement | null>(null);
  const [latestEventFirst, setLatestEventFirst] = useState(
    props.latestEventFirst.getValue());

  const [listAllEvents, setListAllEvents] = useState(
    props.listAllEvents.getValue());

  function handleSettingsClick(event: React.MouseEvent<HTMLButtonElement>) {
    setSettingsAnchor(event.currentTarget);
  };

  function handleSettingsClose() {
    setSettingsAnchor(null);
  };

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

  const isSettingsOpen = Boolean(settingsAnchor);
  const settingsId = isSettingsOpen ? SETTINGS_POPOVER_ID : undefined;

  return (
    <Box className="AppHeader">
      <a className="LogoHref"
        href={props.homeHref}>
        <img className="LogoImg"
          src={props.logoImageSrc}
          alt={props.logoImageSrcAlt || "logo"} />
      </a>

      <Typography className="UserNameNotice">
        Welcome, {props.userName}
      </Typography>

      <Tooltip title="Filter events">
        <TextField className="AppHeaderFilter"
          aria-label="filter events by name or venue"
          label={<Search />}
          id="eventFilterText"
          onChange={e => props.filter.next(e.target.value)} />
      </Tooltip>

      <Tooltip title="Settings">
        <IconButton
          aria-describedby={settingsId}
          onClick={handleSettingsClick}
        >
          <Settings />
        </IconButton>
      </Tooltip>

      <Popover
        aria-label="edit settings"
        id={settingsId}
        open={isSettingsOpen}
        anchorEl={settingsAnchor}
        onClose={handleSettingsClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box className="SettingsMenu">
          <FormControl>
            <FormControlLabel
              control={
                <Switch checked={listAllEvents}
                  onChange={updateListAllEvents}
                />
              }
              label={listAllEvents ? 'All events' : 'Active only'}
            />
          </FormControl>

          <FormControl>
            <FormControlLabel
              control={
                <Switch checked={latestEventFirst}
                  onChange={updateLatestEventFirst}
                />
              }
              label={latestEventFirst ? 'Latest first' : 'Oldest first'}
            />
          </FormControl>

          <FormControl>
            <FormControlLabel label="Logout"
              control={
                <IconButton className="AppHeaderButton"
                  aria-label="logout button"
                  onClick={props.signOut}>
                  <Logout />
                </IconButton>
              }
            />
          </FormControl>
        </Box>
      </Popover>

    </Box>
  );
}
