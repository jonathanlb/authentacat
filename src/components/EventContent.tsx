import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { EventCard, EventCardProps } from './EventCard';

export type EventContentProps = {
  eventCards: Observable<Array<EventCardProps>>;
  filter: Observable<string>;
  latestEventFirst: BehaviorSubject<boolean>;
  showRideShare?: boolean;
  userName?: string;
};

// fade transition only applies to filtered event cards, not reordered or just loaded
const CARD_TRANSITION = 'visibility 0.3s linear,opacity 0.3s linear';

function isCardVisible(ec: EventCardProps, filter: string): boolean {
  return ec.name.toLowerCase().includes(filter) ||
    ec.venue.name.toLowerCase().includes(filter);
}

function sortEventCards(ecs: Array<EventCardProps>, latestFirst: boolean)
  : Array<EventCardProps> {
  const order = latestFirst ? -1 : 1;
  ecs.sort((a, b) => { // print latest events first
    return order * (a.dateTimes[0]?.yyyymmdd || '').localeCompare(
      b.dateTimes[0].yyyymmdd || '');
  });
  return ecs;
}

export function EventContent(props: EventContentProps) {
  const [ eventCards, setEventCards ] = useState([] as Array<EventCardProps>);
  const [ filter, setFilter ] = useState('');
  const [ showRsvpDetails, setShowRsvpDetails ] = useState(false);
  const [ latestEventFirst, setLatestEventFirst ] = useState(false);

  useEffect(() => {
    const ecSub = props.eventCards.subscribe(setEventCards);

    // Listen for changes in interest response
    let irSub: Array<Subscription> = [];
    const irCardSub = props.eventCards.pipe(take(2)).subscribe((eventCards) => {
      irSub = eventCards.map(ec => ec.interestResponse.pipe(take(2)).subscribe(irs => {
        setShowRsvpDetails(irs.length > 0);
      }));
    });

    const filterSub = props.filter.subscribe(updateCardVisibility);
    const latestSub = props.latestEventFirst.subscribe(setLatestEventFirst);

    return function cleanup() {
      ecSub.unsubscribe();
      filterSub.unsubscribe();
      irCardSub.unsubscribe();
      irSub.forEach(s => s.unsubscribe());
      latestSub.unsubscribe();
      setShowRsvpDetails(false);
    }
  }, [ props.eventCards, props.filter, props.latestEventFirst ]);

  function updateCardVisibility(filterStr: string) {
    const trimmedFilter = filterStr.trim().toLowerCase();
    setFilter(trimmedFilter);
  }

  return (
    <Box>
      { sortEventCards([...eventCards], latestEventFirst)
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
                showRideShare={props.showRideShare}
                userName={props.userName}
                {...eventConfig} />
            </Box>
          )
      }
    </Box>
  );
}
