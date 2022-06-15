import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';

import { Observable } from 'rxjs';

import { EventCard, EventCardProps } from './EventCard';

export type EventContentProps = {
  eventCards: Observable<Array<EventCardProps>>;
  filter: Observable<string>;
};

const CARD_TRANSITION = 'visibility 0.3s linear,opacity 0.3s linear';

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
    eventCards.forEach((ec: EventCardProps, i: number) => {
      const elt = document.getElementById(`eventCard_${i}`);
      if (elt != null) {
        if (isCardVisible(ec, trimmedFilter)) {
          elt.style['visibility'] = 'visible';
          elt.style['opacity'] = '1';
          elt.style['height'] = '';
        } else {
          elt.style['visibility'] = 'hidden';
          elt.style['opacity'] = '0';
          elt.style['height'] = '0px';
        }
      }
    });
    return true;
  }

  return (
    <Box>
      { eventCards.map((eventConfig: EventCardProps, i: number) =>
          <Box sx={isCardVisible(eventConfig, filter) ?
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
            id={`eventCard_${i}`}
            key={eventConfig.name} >

            <EventCard
              key={eventConfig.name}
              {...eventConfig} />
          </Box>
        )
      }
    </Box>
  );
}
