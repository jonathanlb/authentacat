import { Event as EventIcon } from '@mui/icons-material';
import ThumbDown from '@mui/icons-material/ThumbDown';
import ThumbUp from '@mui/icons-material/ThumbUp';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Debug from 'debug';
import { useEffect, useState } from 'react';
import { Observable, Observer } from 'rxjs';
import { NO_COUNT, RsvpCount } from '../aggregate';
import { formatDate, formatTime } from '../dateTime';
import './DateTimeInterest.css';
import { InterestIndicator } from './InterestIndicator';
import moment from 'moment-timezone';

const debug = Debug('rsvp:component:dateTime');
const ICON_WIDTH = '24px'; // TODO: pull from styles or other icons

export type DateTimeInterestProps = {
  id: number,
  hhmm: string,
  yyyymmdd: string,
  duration: string,
  getICal: (dtId: number) => Promise<string>,
  readRsvp: Observable<number>,
  rsvp: Observer<number>,
  rsvpCount: Observable<RsvpCount>,
};

export async function downloadICal(dt: DateTimeInterestProps) {
  const errf = (msg: string) => {
    window.alert(`Cannot download ical event: ${msg}`);
    return true;
  }

  try {
    const eventText = await dt.getICal(dt.id)
    debug('download ical', eventText)

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(eventText));
    element.setAttribute('download', 'rsvp.ics');
    element.click();
  } catch (e) {
    errf((e as any).message)
  }
}

export function formatDateTime(dt: DateTimeInterestProps): string {
  return `${formatDate(dt.yyyymmdd)} ${formatTime(dt.hhmm)} (${dt.duration})`;
}

export function extractEventDates(eventText: string): string {
  const start = eventText.match(/DTSTART;TZID=([^:]*):([0-9]+)T([0-9]+)/) || [];
  const end = eventText.match(/DTEND;TZID=([^:]*):([0-9]+)T([0-9]+)/) || [];

  debug('extract start', start)
  debug('extract end', end)

  const getOffset = (m: Array<string>) => 
    (moment.tz.zone(m[1])?.utcOffset(0) || 0) / 60;

  return `${start[2]}T${start[3]}Z${getOffset(start)}/${end[2]}T${end[3]}Z${getOffset(end)}`;
}

export function extractEventLocation(eventText: string): string {
  const m = eventText
    .replace(/\\,/g, ',')
    .replace(/\\n/g, ', ')
    .match(/^LOCATION:(.*)/m) || [];
  debug('extractLocation', m)
  return encodeURIComponent(m[1]);

}

export function extractEventTitle(eventText: string): string {
  const m = eventText
    .replace(/\\,/g, ',')
    .match(/^SUMMARY:(.*)/m) || [];
  debug('extractTitle', m)
  return encodeURIComponent(m[1]);
}

export async function goToGoogleCalendar(dt: DateTimeInterestProps) {
  const errf = (msg: string) => {
    window.alert(`Cannot connect to Google calendar: ${msg}`);
    return true;
  }

  try {
    const eventText = await dt.getICal(dt.id)
    debug('get ical for google', eventText)

    const element = document.createElement('a');
    // https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md
    let calArgs = 'https://calendar.google.com/calendar/render' +
      '?action=TEMPLATE&' +
      `text=${extractEventTitle(eventText)}&` +
      `location=${extractEventLocation(eventText)}&` +
      `dates=${extractEventDates(eventText)}`;
    element.setAttribute('href', calArgs);
    debug('ical', calArgs);
    element.click();
  } catch (e) {
    errf((e as any).message)
  }
}

export function DateTimeInterest(props: DateTimeInterestProps) {
  const formattedDateTime = formatDateTime(props);
  const [rsvp, setRsvp] = useState(0);
  const [rsvpCount, setCount] = useState(NO_COUNT);
  debug('render', props, rsvp, rsvpCount);

  useEffect(() => {
    const sub = props.readRsvp.subscribe(setRsvp);
    return () => sub.unsubscribe();
  }, [props.readRsvp]);

  useEffect(() => {
    const sub = props.rsvpCount.subscribe(setCount);
    return () => sub.unsubscribe();
  }, [props.rsvpCount]);

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

  return (
    <Stack className="DateTimeDiv"
      direction="row"
      key={props.yyyymmdd + props.hhmm}>

      <Tooltip title='Add to iCal'>
        <IconButton onClick={() => downloadICal(props)} aria-label='Add to iCal'>
          <EventIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title='Add to Google Calendar'>
        <IconButton onClick={() => goToGoogleCalendar(props)} aria-label='Add to Google Calendar'>
          <img src="Google_Calendar_icon.svg" width={ICON_WIDTH} alt="Add to Google Calendar" />
        </IconButton>
      </Tooltip>

      <Typography className="DateTimeText"
        color="text.secondary"
        align="right"
        sx={{ width: "50%" }} >
        {formattedDateTime}
      </Typography>
      <Tooltip title="no">
        <ThumbDown onClick={e => handleSlider(-1)} />
      </Tooltip>
      <Box sx={{ width: "25%", marginLeft: "1%", marginRight: "1%" }}>
        <Slider
          aria-label="RSVP"
          data-testid={`date-time-interest-slider-${props.id}`}
          defaultValue={rsvp}
          value={rsvp}
          min={-1} max={1} step={1}
          onChange={handleSlider} />
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
