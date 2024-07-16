export class IsoDate {
  private readonly date: Date | null;
  private readonly timezoneOffset: string | null;

  private constructor(date: Date | null, timezoneOffset: string | null) {
    this.date = date;
    this.timezoneOffset = timezoneOffset;
  }

  public static NULL = new IsoDate(null, null);

  // Returns the date as an ISO string with the original time zone offset without partial seconds.
  public getValue(): string | null {
    if (this.date != null) {
      if (this.timezoneOffset === 'Z') {
        return this.date.toISOString().replace(/\.\d{3}Z$/, 'Z');
      }

      const offsetMatch = this.timezoneOffset!.match(/([+-])(\d{2}):(\d{2})/);
      if (offsetMatch) {
        const sign = offsetMatch[1] === '+' ? 1 : -1;
        const offsetHours = parseInt(offsetMatch[2], 10) * sign;
        const offsetMinutes = parseInt(offsetMatch[3], 10) * sign;

        const utcMilliseconds = this.date.getTime();
        const offsetMilliseconds = (offsetHours * 60 + offsetMinutes) * 60 * 1000;

        const localDate = new Date(utcMilliseconds + offsetMilliseconds);

        const year = localDate.getUTCFullYear();
        const month = localDate.getUTCMonth() + 1;
        const day = localDate.getUTCDate();
        const hour = localDate.getUTCHours();
        const minute = localDate.getUTCMinutes();
        const second = localDate.getUTCSeconds();

        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

        return `${formattedDate}${this.timezoneOffset}`;
      }
      return null;
    } else {
      return null;
    }
  }

  public static forValue(isoDateString: string | null): IsoDate {
    if (!isoDateString) {
      return IsoDate.NULL;
    }
    // Regex to insert colon in timezone offset if missing
    isoDateString = isoDateString.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');

    const date = new Date(isoDateString);
    const timezoneOffset = isoDateString.match(/Z|([+-])([01]\d):?([0-5]\d)$/)?.[0] ?? 'Z';
    return new IsoDate(date, timezoneOffset);
  }

  public static now(): IsoDate {
    const date = new Date();
    const timezoneOffset = this.getCurrentGMTOffset();
    return new IsoDate(date, timezoneOffset);
  }

  public static getCurrentGMTOffset(): string {
    const offset = new Date().getTimezoneOffset();

    const hours = Math.abs(Math.floor(offset / 60));
    const minutes = Math.abs(offset % 60);

    const hoursFormatted = hours.toString().padStart(2, '0');
    const minutesFormatted = minutes.toString().padStart(2, '0');

    const sign = offset > 0 ? '-' : '+';

    return `${sign}${hoursFormatted}:${minutesFormatted}`;
  }
}
