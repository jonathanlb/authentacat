import React from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

import { InterestResponse } from './aggregate';

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
          <Typography variant="h6">
            {responseLabel} ({responses.length})
          </Typography>
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
