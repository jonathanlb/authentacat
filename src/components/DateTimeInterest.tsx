import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { BehaviorSubject } from 'rxjs';

import ThumbDown from '@mui/icons-material/ThumbDown';
import ThumbUp from '@mui/icons-material/ThumbUp';

import './DateTimeInterest.css';
import { RsvpCount } from '../aggregate';
import { formatDate, formatTime } from '../dateTime';
import { InterestIndicator } from './InterestIndicator';

import Debug from 'debug';

const debug = Debug('rsvp:component:dateTime');

export type DateTimeInterestProps = {
  id: number,
  hhmm: string,
  yyyymmdd: string,
  duration: string,
  rsvp: BehaviorSubject<number>, // only call next
  rsvpCount: BehaviorSubject<RsvpCount>, // only call subscribe
};

export function formatDateTime(dt: DateTimeInterestProps): string {
  return `${formatDate(dt.yyyymmdd)} ${formatTime(dt.hhmm)} (${dt.duration})`;
}

export function DateTimeInterest(props: DateTimeInterestProps) {
  const formattedDateTime = formatDateTime(props);
  const [ rsvp, setRsvp ] = useState(props.rsvp.getValue());
  const [ rsvpCount, setCount ] = useState(props.rsvpCount.getValue());
  debug('render', props, rsvp, rsvpCount);

  useEffect(() => {
    const sub = props.rsvp.subscribe(setRsvp);
    return () => sub.unsubscribe();
  }, [ props.rsvp ]);

  useEffect(() => {
    const sub = props.rsvpCount.subscribe(setCount);
    return () => sub.unsubscribe();
  }, [ props.rsvpCount ]);

  function handleSlider(e: Event | number) {
    debug('handleSlider', e);
    debug('handleSlider rsvp', rsvp, rsvpCount);
    let newValue = 0;
    if (typeof e === 'number') {
      newValue = e;
    } else {
      const me = e as any;
      if (me.target != null) {
        newValue = Number(me.target.value); // react-testing converts to string....
      } else {
        return;
      }
    }
    if (newValue !== rsvp) {
      const tmpCount = Object.assign({}, rsvpCount);
      tmpCount.maybe = tmpCount.maybe || 0;
      tmpCount.no = tmpCount.no || 0;
      tmpCount.yes = tmpCount.yes || 0;
      if (rsvp > 0) {
        tmpCount.yes -= 1;
      } else if (rsvp < 0) {
        tmpCount.no -= 1;
      } else {
        tmpCount.maybe -= 1;
      }

      if (newValue > 0) {
        tmpCount.yes += 1;
      } else if (newValue < 0) {
        tmpCount.no += 1;
      } else {
        tmpCount.maybe += 1;
      }
      debug('handleSlider next', newValue, tmpCount);
      props.rsvp.next(newValue);
      setRsvp(newValue);
      setCount(tmpCount);
    }
  }

  return(
    <Stack className="DateTimeDiv"
      direction="row"
      key={props.yyyymmdd + props.hhmm}>
      <Typography className="DateTimeText" 
        color="text.secondary"
        align="right"
        sx={{width: "50%"}} >
        { formattedDateTime }
      </Typography>
      <Tooltip title="no">
        <ThumbDown onClick={e => handleSlider(-1)} />
      </Tooltip>
      <Box sx={{width: "25%", marginLeft: "1%", marginRight: "1%"}}>
        <Slider
          aria-label="RSVP"
          data-testid={`date-time-interest-slider-${props.id}`}
          defaultValue={ props.rsvp.getValue() }
          value={ rsvp }
          min={-1} max={1} step={1} 
          onChange={handleSlider}/>
      </Box>
      <Tooltip title="yes">
        <ThumbUp onClick={e => handleSlider(1)} />
      </Tooltip>
      <Box sx={{ width: "25%" }}>
        <InterestIndicator 
          aria-label={`Interest for ${formattedDateTime}`}
          numYes={rsvpCount.yes}
          numMaybe={rsvpCount.maybe}
          numNo={rsvpCount.no} />
      </Box>
    </Stack>
  );
}
