import { Observable, ReplaySubject } from 'rxjs';

import { EventCardProps } from './EventCard';

export type ServerInterface = {
  eventCards: Observable<Array<EventCardProps>>;

  start: () => Promise<void>;
};
