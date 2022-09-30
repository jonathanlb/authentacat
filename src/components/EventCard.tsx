import React, { useEffect, useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import ReactMarkdown from 'react-markdown';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AirportShuttle from '@mui/icons-material/AirportShuttle';

import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

import './EventCard.css';
import { InterestResponse } from '../aggregate';
import { formatDate, formatTime } from '../dateTime';
import { DateTimeInterest, DateTimeInterestProps } from './DateTimeInterest';
import { InterestReport } from './InterestReport';
import { RideShare } from '../rideShare';
import { RideShareCard } from './RideShareCard';
import { VenueCard, VenueCardProps } from './VenueCard';

import Debug from 'debug';

const debug = Debug('rsvp:component:eventCard');

const RIDESHARE_POPOVER_ID  = 'rideshare-popover';

export type EventCardProps = {
  descriptionMd: string,
  name: string,
  venue: VenueCardProps,
  dateTimes: Array<DateTimeInterestProps>,
  interestResponse: Observable<Array<InterestResponse>>,
  rideShares: BehaviorSubject<Array<RideShare>>,
  showAdmin?: boolean,
  showRideShare?: boolean,
  userName?: string,
};

/**
 * Break up the Observable of responses by dateTimeId and return the subscription to clean up.
 */
export function mapDateTimesToResponses(
  dts: Array<DateTimeInterestProps>,
  irs: Observable<Array<InterestResponse>>,
  )
: [Map<number, Observable<Array<InterestResponse>>>, Subscription] {
  const result = new Map<number, Subject<Array<InterestResponse>>>();
  dts.forEach(dt => result.set(dt.id, new BehaviorSubject<Array<InterestResponse>>([])));

  const sub = irs.subscribe(irArr => {
    const updates = new Map<number, Array<InterestResponse>>();
    irArr.forEach(ir => {
      const id = ir.dt;
      let ar = updates.get(id);
      if (ar === undefined) {
        updates.set(id, [ir]);
      } else {
        ar.push(ir);
      }
    });

    updates.forEach(
      (irs: Array<InterestResponse>, dt: number) =>
        result.get(dt)?.next(irs));
  });

  return [result, sub];
}

export function EventCard(props: EventCardProps) {
  debug('render');
  const [ showInterestReportId, setShowInterestReportId ] = useState(0);
  const [ dateTimeInterest, setDateTimeInterest ] = useState('');
  const [ rideshareAnchor, setRideshareAnchor] = useState<HTMLButtonElement | null>(null);

  const [responses, irSub ] = mapDateTimesToResponses(
    props.dateTimes, props.interestResponse);

  // clean up interest-response subscription on unmount
  useEffect(() => {
    return () => {
      debug('unmount and unsubscribe');
      irSub.unsubscribe();
    }
  });

  function handleShowInterestReport(dt: DateTimeInterestProps) {
    setShowInterestReportId(dt.id);
    setDateTimeInterest(`${formatDate(dt.yyyymmdd)} ${formatTime(dt.hhmm)} (${dt.duration})`);
  }

  function handleHideInterestReport() {
    setShowInterestReportId(0);
  }

  function handleRideshareClick(event: React.MouseEvent<HTMLButtonElement>) {
    setRideshareAnchor(event.currentTarget);
  };

  function handleRideshareClose() {
    setRideshareAnchor(null);
  };

  const isRideshareOpen = Boolean(rideshareAnchor);
  const rideshareId = isRideshareOpen ? RIDESHARE_POPOVER_ID : undefined;

  return(
    <Card className="EventCard" raised={true}>
      <Accordion>
        <AccordionSummary expandIcon={<Tooltip title="Show/hide event details"><ExpandMoreIcon /></Tooltip>}>
          <Typography variant="h3" color="text.primary">
            { props.name }
          </Typography>
        </AccordionSummary>

        <AccordionDetails className='EventDetails'>
          <ReactMarkdown className="EventDescriptionDiv">
            { props.descriptionMd }
          </ReactMarkdown>

          <Box className='VenueOptionsLayout'>
            <VenueCard name={props.venue.name} address={props.venue.address} />

            <Tooltip title="Rideshare Options">
              <IconButton
                aria-describedby={rideshareId}
                onClick={handleRideshareClick}
              >
                <AirportShuttle />
              </IconButton>
            </Tooltip>

            <Popover
              aria-label='show rideshare options'
              id={rideshareId}
              open={isRideshareOpen}
              anchorEl={rideshareAnchor}
              onClose={handleRideshareClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <RideShareCard name={props.userName || '???'} rideShares={props.rideShares} />
            </Popover>
          </Box>

        </AccordionDetails>
      </Accordion>

      { showInterestReportId > 0
        ? <InterestReport
            hideF={handleHideInterestReport} 
            time={dateTimeInterest}
            responses={responses.get(showInterestReportId) as Observable<Array<InterestResponse>>}/>
        : <Card className="DateTimesDiv">
            { props.dateTimes.map((dt, i) =>
               <Box sx={{
                 display: 'flex',
                 flexDirection: 'row',
                 width: '100%',
               }} 
               key={`dt-choice-${i}`} >
               <Box sx={{ width: props.showAdmin ? '90%' : '100%' }}>
                 <DateTimeInterest {...dt} key={i} />
               </Box>

               { props.showAdmin
                   ? <Tooltip title="Show RSVP summary report">
                      <Button 
                        data-testid={`show-rsvp-details-${dt.id}`}
                        aria-label="show rsvp details"
                        sx={{ width: '10%' }}
                        onClick={e => handleShowInterestReport(dt)}>
                        <ExpandMoreIcon />
                      </Button>
                    </Tooltip>
                   : null
               } 
               </Box>
        )}
      </Card>
      }
    </Card>
  );
}
