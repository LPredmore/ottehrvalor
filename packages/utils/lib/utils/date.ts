import { DateTime, DateTimeJSOptions } from 'luxon';
import { DateComponents, Timezone } from '../types';

interface timezone {
  value: string;
  label: string;
}

export const DOB_DATE_FORMAT = 'yyyy-MM-dd';

export const availableTimezones = (date: DateTime | undefined): timezone[] => {
  if (!date) {
    date = DateTime.now();
  }
  const timezones = [
    { value: 'America/New_York', label: '' },
    { value: 'America/Chicago', label: '' },
    { value: 'America/Denver', label: '' },
    { value: 'America/Los_Angeles', label: '' },
  ];
  timezones.forEach((zone) => {
    if (date) {
      zone.label = date.setZone(zone.value).toFormat('ZZZZ');
    } else {
      throw new Error('Date in availableTimezones is undefined');
    }
  });
  return timezones;
};

export function createLocalDateTime(
  dateTime: DateTime | string | undefined,
  timezone: string | undefined = 'America/New_York'
): DateTime | undefined {
  if (!dateTime) return undefined;
  let localDateTime: DateTime | undefined;
  if (typeof dateTime === 'string') {
    const parsedDateTime = DateTime.fromISO(dateTime);
    if (!parsedDateTime.isValid) return undefined;
    localDateTime = parsedDateTime.setZone(timezone);
  } else {
    localDateTime = dateTime.setZone(timezone);
  }
  return localDateTime;
}

export function getBestTimezone(): string {
  // This gets the browser's current timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userTimezoneLabel = DateTime.now().setZone(userTimezone).toFormat('ZZZZ');

  const availableTimezonesNow = availableTimezones(DateTime.now());

  const availableTimezoneForUser = availableTimezonesNow.find((timezone) => timezone.label === userTimezoneLabel);
  if (availableTimezoneForUser != null) {
    return availableTimezoneForUser.value;
  } else {
    // If the user isn't in the accepted list of timezones, set it to the first one (ET)
    return availableTimezonesNow[0].value;
  }
}

export function createDateTimeFromMDYString(dateString?: string, options?: DateTimeJSOptions): DateTime {
  return DateTime.fromFormat(dateString || '', 'MM/dd/yyyy', options) || '';
}

/*
      FHIR wants an iso string without time/timezone information. JS Date parser treats such
      a string as an invitation to convert from the local timezone to UTC, which can result
      in the string displayed in the date input text field being one day off from the actual
      value passed in.
      Converting from yyyy-mm-dd to MM/dd/yyyy prevents this parsing behavior from happening.
      https://stackoverflow.com/questions/7556591/is-the-javascript-date-object-always-one-day-off/31732581#31732581:~:text=All%20of%20this,an%20average%20person.


      The two functions below are for mapping back and forth from iso to mdy. While the user is inputting values we want
      to keep the date in mdy form. Before sending to the backend we want to map to the fhir-approved iso form.
      In no case do we want any time or timezone info in the date strings.

      If an input is provided in the format of the desired output, the input is simply returned.
    */

export const isoStringFromYMDString = (dateString: string): string => {
  if (dateString.includes('/')) {
    return DateTime.fromFormat(dateString || '', 'MM/dd/yyyy').toISODate() || '';
  }

  if (DateTime.fromISO(dateString)) {
    return DateTime.fromISO(dateString || '').toISODate() || '';
  }

  throw new Error('Invalid format provided. Could not parse yyyy-mm-dd date from input.');
};

/*
    FHIR wants an iso string without time/timezone information. JS Date parser treats such
    a string as an invitation to convert from the local timezone to UTC, which can result
    in the string displayed in the date input text field being one day off from the actual
    value passed in.
    Converting from yyyy-mm-dd to MM/dd/yyyy prevents this parsing behavior from happening.
    https://stackoverflow.com/questions/7556591/is-the-javascript-date-object-always-one-day-off/31732581#31732581:~:text=All%20of%20this,an%20average%20person.


    The two functions below are for mapping back and forth from iso to mdy. While the user is inputting values we want
    to keep the date in mdy form. Before sending to the backend we want to map to the fhir-approved iso form.
    In no case do we want any time or timezone info in the date strings.

    If an input is provided in the format of the desired output, the input is simply returned.
  */

export const isoStringFromMDYString = (mdyString: string): string => {
  const [month, day, year] = mdyString.split('/');
  if (month && day && year) {
    return generateYyyyMmDdString(year, month, day);
  }

  const [y, m, d] = mdyString.split('-');

  if (y && m && d) {
    return mdyString;
  }
  throw new Error('Invalid format provided. Could not parse yyyy-mm-dd date from input.');
};

export const mdyStringFromISOString = (isoString: string): string => {
  const dateOnly = isoString.split('T')[0];
  const [year, month, day] = dateOnly.split('-');

  if (year && month && day) {
    return `${month}/${day}/${year}`;
  }

  const [m, d, y] = isoString.split('/');
  if (m && d && y) {
    return isoString;
  }
  throw new Error('Invalid format provided. Could not parse MM/dd/yyyy date from input.');
};

export const yupDateTransform = (d: any): string => {
  if (typeof d === 'object') {
    const { year, month, day } = d;
    return isoStringFromYMDString(`${month}/${day}/${year}`);
  }
  try {
    return isoStringFromYMDString(d || '');
  } catch (e) {
    return d;
  }
};

export function removeTimeFromDate(date: string): string {
  return date.split('T')[0];
}

export function createDateTimeInET(date: string): DateTime {
  return DateTime.fromISO(date, { zone: 'America/New_York' });
}

export function formatDateForFHIR(date: string): string {
  const parts = date.split('/');
  const year = parts[2];
  const month = parts[0].padStart(2, '0');
  const day = parts[1].padStart(2, '0');
  const outputDate = generateYyyyMmDdString(year, month, day);
  return outputDate;
}

// todo: maybe add option shouldThrowError with default 'false'
export function formatDate(date: DateTime | string, format?: string): string {
  const FALLBACK = '-';

  if (!date || (date as DateTime)?.isValid === false) return FALLBACK;

  const dateTime = typeof date === 'string' ? DateTime.fromISO(date) : date;

  if (!dateTime || !dateTime.isValid) return FALLBACK;

  try {
    const formatted = format ? dateTime.toFormat(format) : dateTime.toISO();

    if (!formatted || formatted.toLowerCase().includes('invalid')) {
      return FALLBACK;
    }

    return formatted;
  } catch {
    return FALLBACK;
  }
}

export const getDateTimeFromDateAndTime = (date: DateTime, hour: number): DateTime => {
  let combinedDateTime = null;
  combinedDateTime = date
    .set({
      hour: hour,
    })
    .startOf('hour');

  return combinedDateTime;
};

export function dobValidation(dateOfBirth: string): boolean {
  const currentDate = DateTime.fromFormat(dateOfBirth, DOB_DATE_FORMAT);
  if (currentDate.isValid) {
    const now = DateTime.now();
    if (currentDate <= now) {
      return true;
    }
  }
  return false;
}

export const getDateComponentsFromISOString = (isoString: string | undefined): DateComponents => {
  if (isoString) {
    const parsedDate = DateTime.fromFormat(isoString, DOB_DATE_FORMAT);
    if (!parsedDate.isValid) {
      console.error(`DateInput defaultValue is invalid: ${isoString}, ${parsedDate.invalidExplanation}`);
    }
    const { year, month, day } = parsedDate;
    return {
      year: year < 10 ? `0${year}` : `${year}`,
      month: month < 10 ? `0${month}` : `${month}`,
      day: day < 10 ? `0${day}` : `${day}`,
    };
  } else {
    return {
      year: '',
      month: '',
      day: '',
    };
  }
};

export const isoStringFromDateComponents = (dc: DateComponents): string | undefined => {
  const { year, month, day } = dc;

  const isoString = generateYyyyMmDdString(year, month, day);
  const parsedDate = DateTime.fromFormat(isoString, DOB_DATE_FORMAT);
  if (!parsedDate.isValid) {
    console.error(`Date is invalid: ${isoString}, ${parsedDate.invalidExplanation}`);
    return;
  }

  return parsedDate.toFormat(DOB_DATE_FORMAT);
};

export function formatDateTimeToLocaleString(datetime: string, format: 'date' | 'datetime', timezone?: string): string {
  if (!datetime) return '';
  if (format === 'date') {
    return DateTime.fromISO(datetime).toLocaleString(DateTime.DATE_SHORT);
  } else {
    // if not timezone provided - set timezone to UTC
    if (!timezone) {
      timezone = DateTime.utc().zone.name;
    }

    const datetimeWithTimezone = DateTime.fromISO(datetime).setZone(timezone);

    if (!datetimeWithTimezone.isValid) {
      throw new Error('Invalid timezone');
    }

    return datetimeWithTimezone.toLocaleString({ ...DateTime.DATETIME_SHORT, timeZoneName: 'short' });
  }
}

export const tryFormatDateToISO = (date: DateTime | null): string | undefined => {
  if (!date || !date.isValid) {
    return undefined;
  }
  try {
    return date.toISODate() || undefined;
  } catch (dateError) {
    console.error('Error formatting date:', dateError);
  }
  return;
};

export const formatVisitDate = (dateString: string, format: string, timezone?: string): string => {
  let date = DateTime.fromISO(dateString);
  if (timezone) {
    date = date.setZone(timezone);
  }

  if (format == 'birth') {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleString(options);
  } else if (format == 'visit') {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return date.toLocaleString(options);
  }
  return dateString;
};

export function isHoliday(date: DateTime, federalHolidays: Record<string, Set<string>>): boolean {
  const dateString = date.toISODate();
  const year = date.year;
  return federalHolidays[year]?.has(dateString || '') ?? false;
}

export const generateYyyyMmDdString = (year: string, month: string, day: string): string => `${year}-${month}-${day}`;

export const formatDateTimeToZone = (isoDate: string | undefined, timezone: Timezone): string | undefined => {
  if (!isoDate) return undefined;
  const dt = DateTime.fromISO(isoDate).setZone(timezone);
  return `${dt.toLocaleString(DateTime.DATETIME_SHORT, { locale: 'en-US' })} (${dt.toFormat('ZZZZ')})`;
};

export const formatDateTimeToLocalTimezone = (isoDate: string | undefined): string | undefined => {
  if (!isoDate) return undefined;
  const timezone = DateTime.local().zone.name;
  const dt = DateTime.fromISO(isoDate).setZone(timezone);
  return `${dt.toLocaleString(DateTime.DATETIME_SHORT, { locale: 'en-US' })} (${dt.toFormat('ZZZZ')})`;
};

export const formatDateToMDYWithTime = (isoDate: string | undefined): string | undefined => {
  if (!isoDate) return undefined;
  const dateTime = DateTime.fromISO(isoDate, { zone: 'utc' });

  return dateTime.toFormat("MM/dd/yyyy 'at' hh:mm a");
};
