import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';

import { Observable } from 'rxjs';

import { EventCard, EventCardProps } from './EventCard';

export type EventContentProps = {
  eventCards: Observable<Array<EventCardProps>>;
  filter: Observable<string>;
  showRsvpDetails?: boolean;
};

export function EventContent(props: EventContentProps) {
  const [ eventCards, setEventCards ] = useState([] as Array<EventCardProps>);
  const [ filter, setFilter ] = useState('');

  useEffect(() => {
    props.eventCards.subscribe(setEventCards);
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
          .filter((ec: EventCardProps) => isCardVisible(ec, filter))
          .map((eventConfig: EventCardProps, i: number) =>
            <Box data-testid={`eventCard_${i}`}
              className="EventCardBox"
              key={eventConfig.name} >
              <EventCard
                key={eventConfig.name}
                showAdmin={props.showRsvpDetails}
                {...eventConfig} />
            </Box>
          )
      }
    </Box>
  );
}
