import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import './VenueCard.css';

export type VenueCardProps = {
  name: string,
  address: string,
};

export function VenueCard(props: VenueCardProps) {
  return (
    <Box className="VenueCard">
      <Typography color="text.primary">
        { props.name }
      </Typography>
      <Typography color="text.secondary">
        { props.address }
      </Typography>
    </Box>
  );
}
