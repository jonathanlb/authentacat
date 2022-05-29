import React, {useState} from 'react';

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

import './EventCard.css';
import { DateTimeInterest, DateTimeInterestProps } from './DateTimeInterest';
import { formatDate, formatTime } from './DateTimeInterest';
import { InterestReport } from './InterestReport';
import { VenueCard, VenueCardProps } from './VenueCard';

export type EventCardProps = {
  descriptionMd: string,
  name: string,
  venue: VenueCardProps,
  dateTimes: Array<DateTimeInterestProps>,
};

const showAdmin = true;

function dummyInterestResponse() {
  return Promise.resolve([
    { name: 'Adam',
      section: 'Alto',
      rsvp: 1,
    },
    { name: 'Alvin',
      section: 'Alto',
      rsvp: 1,
    },
    { name: 'Arnie',
      section: 'Alto',
      rsvp: 0,
    },
    { name: 'Beth',
      section: 'Bass',
      rsvp: -1,
    },
    { name: 'Carlos',
      section: 'Conductor',
      rsvp: 1,
    },
    { name: 'Susan',
      section: 'Soprano',
      rsvp: 1,
    },
    { name: 'Ted',
      section: 'Tenor',
      rsvp: 1,
    },
    { name: 'Theodore',
      section: 'Tenor',
      rsvp: 0,
    },
  ]);
}

export function EventCard(props: EventCardProps) {
  const [ showInterestReport, setShowInterestReport] = useState(false);
  const [ dateTimeInterest, setDateTimeInterest] = useState('');

  function handleShowInterestReport(dt: DateTimeInterestProps) {
    setShowInterestReport(true);
    setDateTimeInterest(`${formatDate(dt.yyyymmdd)} ${formatTime(dt.hhmm)} (${dt.duration})`);
  }

  function handleHideInterestReport() {
    setShowInterestReport(false);
  }

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

      { showInterestReport 
        ? <InterestReport hideF={handleHideInterestReport} time={dateTimeInterest} getResponsesP={dummyInterestResponse()}/>  // XXX
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
