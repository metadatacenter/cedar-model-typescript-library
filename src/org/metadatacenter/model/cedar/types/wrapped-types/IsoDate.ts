import { TimestampPolicy } from '../../../../policy/TimestampPolicy';

/** A lossless provenance timestamp, independent of JavaScript Date's millisecond rounding. */
export class IsoDate {
  private constructor(private readonly value: string | null) {}
  public static NULL = new IsoDate(null);

  public getValue(): string | null {
    return this.value;
  }

  public static forValue(value: string | null): IsoDate {
    return value === null || value === '' ? IsoDate.NULL : new IsoDate(TimestampPolicy.canonical(value));
  }

  public static now(): IsoDate {
    const date = new Date();
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, -1);
    return IsoDate.forValue(local + this.getCurrentGMTOffset());
  }

  public static getCurrentGMTOffset(): string {
    const offset = new Date().getTimezoneOffset();

    const absoluteOffset = Math.abs(offset);
    const hours = Math.floor(absoluteOffset / 60);
    const minutes = absoluteOffset % 60;

    const hoursFormatted = hours.toString().padStart(2, '0');
    const minutesFormatted = minutes.toString().padStart(2, '0');

    const sign = offset > 0 ? '-' : '+';

    return `${sign}${hoursFormatted}:${minutesFormatted}`;
  }
}
