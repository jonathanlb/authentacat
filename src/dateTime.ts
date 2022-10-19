// import Debug from 'debug';
// const debug = Debug('rsvp:dateTime');

import { DateTimeInterestProps } from "./components/DateTimeInterest";

const DATE_RE = /^([0-9]{4})[/-]?([0-9]{1,2})[/-]?([0-9]{1,2})$/;
const TIME_RE = /^([0-9]{1,2})[:/-]?([0-9]{2})$/;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format date string for printing. Avoiding Date library to avoid local
 * midnight, etc.
 */
export function formatDate(yyyymmdd: string): string {
  const ymdArray = yyyymmdd.match(DATE_RE) || [];
  if (ymdArray.length !== 4) {
    throw new Error(`Cannot parse date '${yyyymmdd}'`);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, yyyy, mm, dd] = ymdArray;
  const year = parseInt(yyyy, 10);
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  if (month > 12 || day > 31 || month < 1 || day < 1) {
    throw new Error(`Cannot parse date '${yyyymmdd}'`);
  }
  const date = new Date(year, month - 1, day);
  return `${DAYS[date.getDay()]}, ${MONTHS[month - 1]} ${day}, ${year}`;
}

/** Format time for printing. */
export function formatTime(hhmm: string): string {
  const hmAr = hhmm.match(TIME_RE) || [];
  if (hmAr.length !== 3) {
    throw new Error(`Cannot parse time from '${hhmm}'`);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, hh, mm] = hmAr;
  const hour = parseInt(hh, 10);
  let hour4Str;
  if (hour === 0) {
    hour4Str = 12;
  } else if (hour < 13) {
    hour4Str = hour;
  } else {
    hour4Str = hour - 12;
  }
  return `${hour4Str}:${mm} ${hour < 12 ? 'am' : 'pm'}`;
}

export function isUndecided(dts: Array<DateTimeInterestProps>): boolean {
  return !Boolean(dts.find(dt => dt.rsvp.getValue() !== 0));
}

export function lastYear(dOpt?: Date): string {
  const d = dOpt || new Date();
  // Javascript isn't sensitive to 2/28 on non-leapyears.
  d.setFullYear(d.getFullYear() - 1);
  return today(d);
}

export function today(dOpt?: Date): string {
  const d = dOpt || new Date();
  let mm: string | number = d.getMonth()+1;
  if (mm < 10) {
    mm = `0${mm}`;
  }
  let dd: string | number = d.getDate();
  if (dd < 10) {
    dd = `0${dd}`;
  }
  return `${d.getFullYear()}${mm}${dd}`;
}
