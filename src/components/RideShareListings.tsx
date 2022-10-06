import Box from '@mui/material/Box';

import './RideShareListings.css';
import { RideShare } from '../rideShare';
import { Typography } from '@mui/material';

export type RideShareListingsProps = {
  rideShares: Array<RideShare>;
}

export function RideShareListings(props: RideShareListingsProps) {

  const renderRideShares = (rideShares: Array<RideShare>) => {
    return rideShares.map((rs, i) =>
      <Box className='rideShare' key={i}>
        <Typography>{rs.name}</Typography>
        <Typography sx={{ fontStyle: 'italic' }}>{rs.neighborhood}</Typography>
      </Box>
    );
  };

  if (props.rideShares.length === 0) {
    return(
      <Box/>
    );
  }

  return(
    <Box className='rideShareListings'>
      <Box className='rideShareSide'>
        <Typography variant='h6'>
          Riders
        </Typography>
        { renderRideShares(props.rideShares.filter(x => !x.provideRide)) }
      </Box>
      <Box className='rideShareSide'>
        <Typography variant='h6'>
          Drivers 
        </Typography>
        { renderRideShares(props.rideShares.filter(x => x.provideRide)) }
      </Box>
    </Box>
  )
}