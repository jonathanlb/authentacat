import { useState } from 'react';

import { BehaviorSubject } from 'rxjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AirlineSeatReclineExtraIcon from '@mui/icons-material/AirlineSeatReclineExtra';
import Clear from '@mui/icons-material/Clear';
import ElectricCar from '@mui/icons-material/ElectricCar';
import LocationCity from '@mui/icons-material/LocationCity';

import './RideShareCard.css';
import { RideShare } from '../rideShare';
import { RideShareListings } from './RideShareListings';

export type RideShareCardProps = {
    name: string;
    neighborhood?: string;
    provideRide?: boolean;
    rideShares: BehaviorSubject<Array<RideShare>>;
}

const RIDE_SHARE_INSTRUCTIONS = 
'The rideshare board lists participants able to provide or in need of a ride ' +
'from a neighborhood to the event.  You are responsible for coordinating your ' +
'fellow carpoolers.  Use only a rough location labels (e.g. "Uptown" or ' + 
'"West St. Paul"), not your address!';

const NEIGHBORHOOD_TEXT_ID = 'neighborhoodText';

export function RideShareCard(props: RideShareCardProps) {
    const [provideRide, setProvideRide] = useState(props.provideRide || false);
    const [neighborhood, setNeighborhood] = useState(
        props.neighborhood || localStorage['rideshare-neighborhood'] || '');

    function clearRideShare() {
        props.rideShares.next(
            props.rideShares.getValue()
                .filter(x => x.name !== props.name));
    }

    function submitRideShare() {
        const newRideShare = props.rideShares.getValue()
            .filter(x => x.name !== props.name);
        newRideShare.push({
            name: props.name,
            neighborhood: neighborhood,
            provideRide: provideRide,
        });
        props.rideShares.next(newRideShare);
    }

    function updateNeighborhood(e: React.ChangeEvent<HTMLInputElement>) {
        const n = e.target?.value?.trim() || '';
        localStorage['rideshare-neighborhood'] = n;
        setNeighborhood(n);
    }

    return (
        <Card className='RideShareCard'>
            <Box className='RideShareHeader'>

                <Tooltip title={<h2>{RIDE_SHARE_INSTRUCTIONS}</h2>}>
                    <Typography variant='h6' color='text.primary'>
                        Carpooling from?
                    </Typography>
                </Tooltip>

                <Tooltip title='Your neighborhood'>
                    <TextField
                        aria-label='what neighborhood do you ride from'
                        label={<LocationCity />}
                        value={neighborhood}
                        id={NEIGHBORHOOD_TEXT_ID}
                        onChange={updateNeighborhood}
                    />
                </Tooltip>

                <Tooltip title='Will you drive or ride?'>
                    <FormControl>
                        <FormControlLabel
                            control={
                                <Switch checked={provideRide}
                                    onChange={(e) => setProvideRide(e.target.checked)}
                                />
                            }
                            label={provideRide ? 'Drive' : 'Ride'}
                        />
                    </FormControl>
                </Tooltip>

                <Tooltip title='Submit rideshare info'>
                    <Button variant='contained'
                        onClick={submitRideShare}>
                        {provideRide ? <ElectricCar /> : <AirlineSeatReclineExtraIcon />}
                    </Button>
                </Tooltip>

                <Tooltip title='Reset my rideshare info'>
                    <Button variant='outlined'
                        onClick={clearRideShare}>
                        <Clear/>
                    </Button>
                </Tooltip>

            </Box>

            <RideShareListings
                rideShares={props.rideShares} />

        </Card>
    );
}
