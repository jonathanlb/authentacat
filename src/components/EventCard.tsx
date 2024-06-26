import AirportShuttle from '@mui/icons-material/AirportShuttle';
import Cancel from '@mui/icons-material/Cancel';
import Edit from '@mui/icons-material/Edit';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Save from '@mui/icons-material/Save';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Debug from 'debug';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BehaviorSubject, Observable, Observer, Subject, Subscription } from 'rxjs';
import { InterestResponse } from '../aggregate';
import { formatDate, formatTime, isUndecided } from '../dateTime';
import { RideShare } from '../rideShare';
import { DateTimeInterest, DateTimeInterestProps } from './DateTimeInterest';
import './EventCard.css';
import { InterestReport } from './InterestReport';
import { RideShareCard } from './RideShareCard';
import { VenueCard, VenueCardProps } from './VenueCard';

const debug = Debug('rsvp:component:eventCard');

const RIDESHARE_POPOVER_ID = 'rideshare-popover';

export type EventCardProps = {
  editable: boolean,
  expressRideShare: Subject<RideShare>,
  descriptionEdits: Observer<string>,
  descriptionMd: string,
  name: string,
  venue: VenueCardProps,
  dateTimes: Array<DateTimeInterestProps>,
  getICal: (dtId: number) => Promise<string>,
  interestResponse: Observable<Array<InterestResponse>>,
  rideShares: Observable<Array<RideShare>>,
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
  const [dateTimeInterest, setDateTimeInterest] = useState('');
  const [descriptionMd, setDescriptionMd] = useState(props.descriptionMd);
  const [editing, setEditing] = useState(false);
  const [undecided, setUndecided] = useState(true);
  const [rideshareAnchor, setRideshareAnchor] = useState<HTMLButtonElement | null>(null);
  const [showInterestReportId, setShowInterestReportId] = useState(0);

  const [responses, irSub] = mapDateTimesToResponses(
    props.dateTimes, props.interestResponse);

  // monitor responses to clear the undecided flag.
  // clean up interest-response subscription on unmount
  useEffect(() => {
    const undecidedSub = isUndecided(props.dateTimes).subscribe(setUndecided);
    return () => {
      debug('unmount and unsubscribe');
      irSub.unsubscribe();
      undecidedSub.unsubscribe();
    }
  }, [props.dateTimes, irSub, setUndecided]);

  function handleEditClick() {
    setEditing(!editing);
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

  function handleSaveClick() {
    const content = (document.getElementById('eventEditor') as HTMLInputElement)?.value?.trim();
    props.descriptionEdits.next(content);
    setDescriptionMd(content);
    setEditing(false);
  }

  function handleShowInterestReport(dt: DateTimeInterestProps) {
    setShowInterestReportId(dt.id);
    setDateTimeInterest(`${formatDate(dt.yyyymmdd)} ${formatTime(dt.hhmm)} (${dt.duration})`);
  }

  const isRideshareOpen = Boolean(rideshareAnchor);
  const rideshareId = isRideshareOpen ? RIDESHARE_POPOVER_ID : undefined;

  return (
    <Card className={`${undecided ? 'Undecided' : ''} EventCard`} raised={true}>
      <Accordion>
        <AccordionSummary expandIcon={<Tooltip title="Click to show/hide event details"><ExpandMore /></Tooltip>}>
          <Tooltip title="Click to show/hide event details">
            <Typography variant="h3" color="text.primary">
              {props.name}
            </Typography>
          </Tooltip>
        </AccordionSummary>

        <AccordionDetails className='EventDetails'>
          {!props.editable || editing ?
            null :
            <Tooltip title='Edit markdown event description'>
              <IconButton sx={{ position: 'absolute' }}
                className='EditEventButton'
                onClick={handleEditClick}
              >
                <Edit />
              </IconButton>
            </Tooltip>
          }

          {props.editable && editing ?
            <Box className='Editor'>
              <TextField id='eventEditor' 
                className='EditorText'
                multiline={true}
                defaultValue={descriptionMd} />
              
              <Box className='EditorControls'>
                <Tooltip title='Discard edits'>
                  <IconButton onClick={handleEditClick} >
                    <Cancel />
                  </IconButton>
                </Tooltip>

                <Tooltip title='Save markdown event description'>
                  <IconButton onClick={handleSaveClick} >
                    <Save />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box> :
            <ReactMarkdown className='EventDescriptionDiv'>
              {descriptionMd}
            </ReactMarkdown>
          }

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
              <RideShareCard
                expressRideShare={props.expressRideShare}
                rideShares={props.rideShares} />
            </Popover>
          </Box>

        </AccordionDetails>
      </Accordion>

      {showInterestReportId > 0
        ? <InterestReport
          hideF={handleHideInterestReport}
          time={dateTimeInterest}
          responses={responses.get(showInterestReportId) as Observable<Array<InterestResponse>>} />
        : <Card className="DateTimesDiv">
          {props.dateTimes.map((dt, i) =>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
            }}
              key={`dt-choice-${i}`} >
              <Box sx={{ width: props.showAdmin ? '90%' : '100%' }}>
                <DateTimeInterest {...dt} key={i} getICal={props.getICal} />
              </Box>

              {props.showAdmin
                ? <Tooltip title="Show RSVP summary report">
                  <Button
                    data-testid={`show-rsvp-details-${dt.id}`}
                    aria-label="show rsvp details"
                    sx={{ width: '10%' }}
                    onClick={e => handleShowInterestReport(dt)}>
                    <ExpandMore />
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
