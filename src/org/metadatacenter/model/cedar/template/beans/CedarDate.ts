export class CedarDate {
  private readonly date: Date;
  private readonly timezoneOffset: string;

  private constructor(date: Date, timezoneOffset: string) {
    this.date = date;
    this.timezoneOffset = timezoneOffset;
  }

  // Returns the date as an ISO string with the original time zone offset without partial seconds.
  public getValue(): string {
    const year = this.date.getUTCFullYear();
    const month = this.date.getUTCMonth() + 1;
    const day = this.date.getUTCDate();
    const hour = this.date.getUTCHours();
    const minute = this.date.getUTCMinutes();
    const second = this.date.getUTCSeconds();

    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

    return `${formattedDate}${this.timezoneOffset}`;
  }

  public static forValue(isoDateString: string | null): CedarDate | null {
    if (!isoDateString) {
      return null;
    }

    const date = new Date(isoDateString);
    const timezoneOffset = isoDateString.match(/Z|([+-])([01]\d):?([0-5]\d)$/)?.[0] ?? 'Z';
    return new CedarDate(date, timezoneOffset);
  }

  toJSON() {
    return this.getValue();
  }
}
