import { useEffect, useState } from 'react';

import { Observable, Subject } from 'rxjs';


import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AirlineSeatReclineExtraIcon from '@mui/icons-material/AirlineSeatReclineExtra';
import CloseIcon from '@mui/icons-material/Close';
import ElectricCar from '@mui/icons-material/ElectricCar';
import LocationCity from '@mui/icons-material/LocationCity';
import NoTransfer from '@mui/icons-material/NoTransfer';

import './RideShareCard.css';
import { RideShare } from '../rideShare';
import { RideShareListings } from './RideShareListings';

import Debug from 'debug';

const debug = Debug('rsvp:component:rideShareCard');

export type RideShareCardProps = {
    expressRideShare: Subject<RideShare>;
    neighborhood?: string;
    provideRide?: boolean;
    rideShares: Observable<Array<RideShare>>;
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
    const [neighborhoodError, setNeighborhoodError] = useState('');
    const [rideShares, setRideShares] = useState([] as Array<RideShare>);

    function clearRideShare() {
        debug('clear rideshare');
        props.expressRideShare.next({
            name: '',
            neighborhood: '',
            provideRide: false,
        });
    }

    function submitRideShare() {
        const trimmedNeighborhood = neighborhood.trim();
        if (trimmedNeighborhood) {
            debug('submit rideshare', trimmedNeighborhood, provideRide);
            props.expressRideShare.next({
                name: '',
                neighborhood: trimmedNeighborhood,
                provideRide: provideRide,
            });
        } else {
            setNeighborhoodError(
                'You must provide a neighborhood name.  Use the clear-ride button to remove your listing.');
        }
    }

    function updateNeighborhood(e: React.ChangeEvent<HTMLInputElement>) {
        const n = e.target?.value;
        localStorage['rideshare-neighborhood'] = n?.trim();
        setNeighborhood(n);
    }

    useEffect(() => {
        const sub = props.rideShares.subscribe(setRideShares);
        return () => sub.unsubscribe();
    }, [ props.rideShares ]);

    return (
        <Card className='RideShareCard'>
            <Box className='RideShareHeader'>

                <Tooltip title={<h2>{RIDE_SHARE_INSTRUCTIONS}</h2>}>
                    <Typography variant='h6' color='text.primary'>
                        Carpooling from?
                    </Typography>
                </Tooltip>

                <Tooltip title='Your neighborhood'>
                    <Box>
                        <Box sx={{ width: '100%' }}>
                            <Collapse in={'' !== neighborhoodError}>
                                <Alert
                                    severity='warning'
                                    action={
                                        <IconButton
                                            aria-label="close neighborhood error alert"
                                            color="inherit"
                                            size="small"
                                            onClick={() => setNeighborhoodError('') }
                                        >
                                            <CloseIcon fontSize="inherit" />
                                        </IconButton>
                                    }
                                    sx={{ mb: 2 }}
                                >
                                    {neighborhoodError}
                                </Alert>
                            </Collapse>
                        </Box>
                        <TextField
                            aria-label='what neighborhood do you ride from'
                            label={<LocationCity />}
                            value={neighborhood}
                            id={NEIGHBORHOOD_TEXT_ID}
                            onChange={updateNeighborhood}
                        />
                    </Box>
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
                        <NoTransfer/>
                    </Button>
                </Tooltip>

            </Box>

            <RideShareListings
                rideShares={rideShares} />

        </Card>
    );
}
