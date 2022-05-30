import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

import { InterestResponse } from './aggregate';

export type RollCallTabProps = {
  rsvps: Array<InterestResponse>,
  hideSection?: boolean,
}

export function RollCallTab(props: RollCallTabProps) {
  const affirmatives = props.rsvps.filter(r => r.rsvp > 0);
  const maybes = props.rsvps.filter(r => r.rsvp === 0);
  const negatives = props.rsvps.filter(r => r.rsvp < 0);

  return(
    <Box>
      <Typography variant="h6">Affirmative ({affirmatives.length})</Typography>
      <List>
        { affirmatives.map((rsvp, i) => (
            <ListItem key={i}>
              { rsvp.name } {props.hideSection ? '' : `(${rsvp.section})`}
            </ListItem>
          ))
        }
      </List>
      <Typography variant="h6">Maybe ({maybes.length})</Typography>
      <List>
        { maybes.map((rsvp, i) => (
            <ListItem key={i}>
              { rsvp.name } {props.hideSection ? '' : `(${rsvp.section})`}
            </ListItem>
          ))
        }
      </List>
      <Typography variant="h6">Negative ({negatives.length})</Typography>
      <List>
        { negatives.map((rsvp, i) => (
            <ListItem key={i}>
              { rsvp.name } {props.hideSection ? '' : `(${rsvp.section})`}
            </ListItem>
          ))
        }
      </List>
    </Box>
  );
}
