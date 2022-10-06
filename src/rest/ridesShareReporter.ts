import Debug from 'debug';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { RestClient } from './restClient';
import { RideShare } from '../rideShare';

const debug = Debug('rsvp:rideShare');

export type RideShareReporterOpts = {
    accessToken?: string;
    serverName: string;
}

export class RideShareReporter extends RestClient {
    rideShares: Map<number, BehaviorSubject<Array<RideShare>>>;
    rideShareSetters: Map<number, Subject<RideShare>>;

    constructor(config: RideShareReporterOpts) {
        super(config);
        this.rideShares = new Map();
        this.rideShareSetters = new Map();
    }

    getRideShares(eventId: number): Observable<Array<RideShare>> {
        let rs = this.rideShares.get(eventId);
        if (rs !== undefined) {
            return rs;
        }

        rs = new BehaviorSubject<Array<RideShare>>([]);
        this.rideShares.set(eventId, rs);
        const url = `${this.serverName}/rideshare/get/${eventId}`;
        debug('getRideShares', url);
        this.fetchJson(url)
            .then(rss => {
                debug('gotRideShares', rss);
                rss.forEach((r: any) => r.provideRide = r.provideSeats > 0);
                rs?.next(rss);
            });
        return rs;
    }

    setRideShares(eventId: number): Subject<RideShare> {
        let srs = this.rideShareSetters.get(eventId);
        if (srs !== undefined) {
            return srs;
        }

        srs = new Subject<RideShare>();
        this.rideShareSetters.set(eventId, srs);
        srs.subscribe(rs => {
            const numSeats = rs.provideRide ? 1 : -1;
            const { neighborhood } = rs;
            const url = neighborhood
                ? `${this.serverName}/rideshare/express/${eventId}/${numSeats}/${neighborhood}`
                : `${this.serverName}/rideshare/clear/${eventId}`;
            debug('setRideShares', url);
            this.fetchJson(url)
            .then(rss => {
                debug('setRideShares result', rss);
                rss.forEach((r: any) => r.provideRide = r.provideSeats > 0);
                let rs = this.rideShares.get(eventId);
                if (rs === undefined) {
                    this.rideShares.set(eventId, new BehaviorSubject(rss));
                } else {
                    rs.next(rss);
                }
            });
        });
        return srs;
    }
}
