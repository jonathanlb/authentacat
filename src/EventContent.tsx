import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';

import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { EventCard, EventCardProps } from './EventCard';

export type EventContentProps = {
  eventCards: Observable<Array<EventCardProps>>;
  filter: Observable<string>;
};

const CARD_TRANSITION = 'visibility 0.3s linear,opacity 0.3s linear';

export function EventContent(props: EventContentProps) {
  const [ eventCards, setEventCards ] = useState([] as Array<EventCardProps>);
  const [ filter, setFilter ] = useState('');
  const [ showRsvpDetails, setShowRsvpDetails ] = useState(false);

  useEffect(() => {
    const ecSub = props.eventCards.subscribe(setEventCards);
    // Listen for changes in interest response
    let irSub: Array<Subscription> = [];
    const irCardSub = props.eventCards.pipe(take(2)).subscribe((eventCards) => {
      irSub = eventCards.map(ec => ec.interestResponse.pipe(take(2)).subscribe(irs => {
        if (irs.length > 0) {
          setShowRsvpDetails(true);
        }
      }));
    });

    return function cleanup() {
      ecSub.unsubscribe();
      irCardSub.unsubscribe();
      irSub.forEach(s => s.unsubscribe());
    }
  }, [ props.eventCards ]);

  useEffect(() => {
    props.filter.subscribe(updateCardVisibility);
  }, [ props.filter ]);

  function isCardVisible(ec: EventCardProps, filter: string): boolean {
    return ec.name.toLowerCase().includes(filter) ||
      ec.venue.name.toLowerCase().includes(filter);
  }

  function updateCardVisibility(filterStr: string) {
    const trimmedFilter = filterStr.trim().toLowerCase();
    setFilter(trimmedFilter);
  }

  return (
    <Box>
      { eventCards
          .map((eventConfig: EventCardProps, i: number) =>
            <Box data-testid={`eventCard_${i}`}
              sx={isCardVisible(eventConfig, filter) ?
                { visibility: 'visible',
                  opacity: 1,
                  transition: CARD_TRANSITION,
                } :
                { visibility: 'hidden',
                  opacity: 0,
                  height: '0px',
                  transition: CARD_TRANSITION,
                }
              }
              key={eventConfig.name} >
              <EventCard
                key={eventConfig.name}
                showAdmin={showRsvpDetails}
                {...eventConfig} />
            </Box>
          )
      }
    </Box>
  );
}
