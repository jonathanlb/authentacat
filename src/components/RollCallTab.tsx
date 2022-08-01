import React from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
 
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { InterestResponse } from '../aggregate';

export type RollCallTabProps = {
  rsvps: Array<InterestResponse>,
  hideNonResponses?: boolean,
  hideSection?: boolean,
}

export function RollCallTab(props: RollCallTabProps) {
  const affirmatives = props.rsvps.filter(r => r.rsvp > 0);
  const maybes = props.rsvps.filter(r => r.rsvp === 0);
  const negatives = props.rsvps.filter(r => r.rsvp < 0);

  function buildResponse(
    responseLabel: string, 
    responses: Array<InterestResponse>) 
  {
    if (!(props.hideNonResponses && !responses.length)) {
      return (
        <Box>
          
          <Accordion>
            <AccordionSummary expandIcon={<Tooltip title="Show/hide email list"><ExpandMoreIcon /></Tooltip>}>
              <Typography variant="h6">
                {responseLabel} ({responses.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                { responses.map((rsvp, i) => rsvp.email).join(', ') }
              </Typography>
            </AccordionDetails>
          </Accordion>

          <List>
            { responses.map((rsvp, i) => (
                <ListItem key={i}>
                  { rsvp.name } {props.hideSection ? '' : `(${rsvp.section})`}
                </ListItem>
              ))
            }
          </List>
        </Box>
      );
    } else {
      return (<Box/>);
    }
  }

  return(
    <Box>
      { buildResponse('Affirmative', affirmatives) }
      { buildResponse('Maybe', maybes) }
      { buildResponse('Negative', negatives) }
    </Box>
  );
}
