import { useState, useEffect } from 'react';

import { Observable } from 'rxjs';

import Box from '@mui/material/Box';

import './RideShareListings.css';
import { RideShare } from '../rideShare';
import { Typography } from '@mui/material';

export type RideShareListingsProps = {
  rideShares: Observable<Array<RideShare>>;
}

export function RideShareListings(props: RideShareListingsProps) {
  const [ rideShares, setRideShares ] = useState([] as Array<RideShare>);

  useEffect(() => {
    const sub = props.rideShares.subscribe(setRideShares);
    return () => sub.unsubscribe();
  }, [ props.rideShares ]);

  const renderRideShares = (rideShares: Array<RideShare>) => {
    return rideShares.map((rs, i) =>
      <Box className='rideShare' key={i}>
        <Typography>{rs.name}</Typography>
        <Typography sx={{ fontStyle: 'italic' }}>{rs.neighborhood}</Typography>
      </Box>
    );
  };

  if (rideShares.length === 0) {
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
        { renderRideShares(rideShares.filter(x => !x.provideRide)) }
      </Box>
      <Box className='rideShareSide'>
        <Typography variant='h6'>
          Drivers 
        </Typography>
        { renderRideShares(rideShares.filter(x => x.provideRide)) }
      </Box>
    </Box>
  )
}