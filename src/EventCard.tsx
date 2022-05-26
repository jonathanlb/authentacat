import React from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Card from '@mui/material/Card';
import ReactMarkdown from 'react-markdown';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import './EventCard.css';
import { DateTimeInterest, DateTimeInterestProps } from './DateTimeInterest';
import { VenueCard, VenueCardProps } from './VenueCard';

export type EventCardProps = {
  descriptionMd: string,
  name: string,
  venue: VenueCardProps,
  dateTimes: Array<DateTimeInterestProps>,
};

export function EventCard(props: EventCardProps) {
  return(
    <Card className="EventCard" raised={true}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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

      <Card className="DateTimesDiv">
        { props.dateTimes.map((dateTime, i) => <DateTimeInterest {...dateTime} key={i} /> )}
      </Card>
    </Card>
  );
}
