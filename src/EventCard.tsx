import React, { useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import ReactMarkdown from 'react-markdown';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Observable } from 'rxjs';

import './EventCard.css';
import { InterestResponse, RsvpCount, summarizeResponses } from './aggregate';
import { formatDate, formatTime } from './dateTime';
import { DateTimeInterest, DateTimeInterestProps } from './DateTimeInterest';
import { InterestReport } from './InterestReport';
import { VenueCard, VenueCardProps } from './VenueCard';

import Debug from 'debug';

const debug = Debug('rsvp:component:eventCard');

export type EventCardProps = {
  descriptionMd: string,
  name: string,
  venue: VenueCardProps,
  dateTimes: Array<DateTimeInterestProps>,
  interestResponse: Observable<Array<InterestResponse>>, // XXX wrong, need to break up by datetime
};

const showAdmin = true;

export function EventCard(props: EventCardProps) {
  debug('render');
  const [ showInterestReportId, setShowInterestReportId ] = useState(0);
  const [ dateTimeInterest, setDateTimeInterest ] = useState('');

  function handleShowInterestReport(dt: DateTimeInterestProps) {
    setShowInterestReportId(dt.id);
    setDateTimeInterest(`${formatDate(dt.yyyymmdd)} ${formatTime(dt.hhmm)} (${dt.duration})`);
  }

  function handleHideInterestReport() {
    setShowInterestReportId(0);
  }

  const responses = new Map<number, Observable<Array<InterestResponse>>>();
  props.dateTimes.forEach(dt => 
    responses.set(dt.id, props.interestResponse));

  return(
    <Card className="EventCard" raised={true}>
      <Accordion>
        <AccordionSummary expandIcon={<Tooltip title="Show/hide event details"><ExpandMoreIcon /></Tooltip>}>
          <Typography variant="h3" color="text.primary">
            { props.name }
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <ReactMarkdown className="EventDescriptionDiv">
            { props.descriptionMd }
          </ReactMarkdown>
          <VenueCard name={props.venue.name} address={props.venue.address}/>
        </AccordionDetails>
      </Accordion>

      { showInterestReportId > 0
        ? <InterestReport hideF={handleHideInterestReport} 
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
               <Box sx={{ width: showAdmin ? '90%' : '100%' }}>
                 <DateTimeInterest {...dt} key={i} />
               </Box>

               { showAdmin
                   ? <Tooltip title="Show RSVP summary report">
                      <Button sx={{ width: '10%' }} onClick={e => handleShowInterestReport(dt)}>
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
