import { Observer } from 'rxjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Logout from '@mui/icons-material/Logout';
import Search from '@mui/icons-material/Search';

import './AppHeader.css';

export type AppHeaderProps = {
  filter: Observer<string>;
  homeHref: string;
  logoImageSrc: string
  logoImageSrcAlt?: string;
  signOut?: (data: any) => void;
  userName: string;
}

export function AppHeader(props: AppHeaderProps) {
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

      <Tooltip title="Logout">
      <Button className="AppHeaderButton" 
        aria-label="logout button"
        onClick={props.signOut}>
        <Logout/>
      </Button>
      </Tooltip>
      </Box>
  );
}
