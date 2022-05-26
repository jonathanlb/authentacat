import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ThumbDown from '@mui/icons-material/ThumbDown';
import ThumbUp from '@mui/icons-material/ThumbUp';

import './DateTimeInterest.css';
import { InterestIndicator } from './InterestIndicator';

const DATE_RE = /^([0-9]{4})[/-]?([0-9]{1,2})[/-]?([0-9]{1,2})$/;
const TIME_RE = /^([0-9]{1,2})[:/-]?([0-9]{2})$/;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export type RsvpCount = {
  yes: number,
  no: number,
  maybe: number,
};

export type DateTimeInterestProps = {
  hhmm: string,
  yyyymmdd: string,
  duration: string,
  rsvp: number,
  rsvpCount: RsvpCount,
};

/**
 * Format date string for printing. Avoiding Date library to avoid local
 * midnight, etc.
 */
export function formatDate(yyyymmdd: string): string {
  const ymdArray = yyyymmdd.match(DATE_RE) || [];
  if (ymdArray.length !== 4) {
    throw new Error(`Cannot parse date '${yyyymmdd}'`);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, yyyy, mm, dd] = ymdArray;
  const year = parseInt(yyyy, 10);
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  if (month > 12 || day > 31 || month < 1 || day < 1) {
    throw new Error(`Cannot parse date '${yyyymmdd}'`);
  }
  const date = new Date(year, month - 1, day);
  return `${DAYS[date.getDay()]}, ${MONTHS[month - 1]} ${day}, ${year}`;
}

/** Format time for printing. */
export function formatTime(hhmm: string): string {
  const hmAr = hhmm.match(TIME_RE) || [];
  if (hmAr.length !== 3) {
    throw new Error(`Cannot parse time from '${hhmm}'`);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, hh, mm] = hmAr;
  const hour = parseInt(hh, 10);
  let hour4Str;
  if (hour === 0) {
    hour4Str = 12;
  } else if (hour < 13) {
    hour4Str = hour;
  } else {
    hour4Str = hour - 12;
  }
  return `${hour4Str}:${mm} ${hour < 12 ? 'am' : 'pm'}`;
}

export function formatDateTime(dt: DateTimeInterestProps): string {
  return `${formatDate(dt.yyyymmdd)} ${formatTime(dt.hhmm)} (${dt.duration})`;
}

export function DateTimeInterest(props: DateTimeInterestProps) {
  const formattedDateTime = formatDateTime(props);
  const [ rsvp, setRsvp ] = useState(props.rsvp);
  const [ rsvpCount, setCount ] = useState(props.rsvpCount);

  function handleSlider(e: Event) {
    const me = e as any;
      if (me.target != null) {
      const newValue = me.target.value;
      if (newValue !== rsvp) {
        const tmpCount = Object.assign({}, rsvpCount);
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
        setRsvp(newValue);
        setCount(tmpCount);
      }
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
      <ThumbDown/>
      <Box sx={{width: "25%", marginLeft: "1%", marginRight: "1%"}}>
        <Slider
          aria-label="RSVP"
          defaultValue={ props.rsvp }
          min={-1} max={1} step={1} 
          onChange={handleSlider}/>
      </Box>
      <ThumbUp/>
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
