/** Shared partial temporal default grammar; instance atoms retain complete XSD spellings. */
export class TemporalDefaultPolicy {
  private static readonly zone = '(?:Z|[+-](?:(?:0\\d|1[0-3]):[0-5]\\d|14:00))?';
  private static readonly hour = '(?:[01]\\d|2[0-3])';
  private static readonly minute = '[0-5]\\d';
  private static readonly second = '[0-5]\\d';

  public static assertValid(temporalType: string | null, granularity: string | null, defaultValue: string | null): void {
    if (defaultValue === null || defaultValue === '') {
      return;
    }

    const type = temporalType;
    if (type === null) {
      throw new Error('Temporal default requires a temporal datatype.');
    }
    if (!this.isCompatibleGranularity(temporalType, granularity)) {
      throw new Error(`Temporal datatype ${type} is not compatible with ${granularity} granularity.`);
    }

    const date = this.datePattern(granularity, type === 'xsd:date');
    const time = this.timePattern(granularity);
    let pattern: RegExp;
    if (type === 'xsd:date') {
      pattern = date;
    } else if (type === 'xsd:time') {
      pattern = time;
    } else {
      pattern = this.dateTimePattern(granularity);
    }

    if (!pattern.test(defaultValue) || !this.hasValidCalendarDate(defaultValue)) {
      throw new Error(
        `Temporal default "${defaultValue}" is not valid for ${type}` + (granularity === null ? '.' : ` at ${granularity} granularity.`),
      );
    }
  }

  private static isCompatibleGranularity(temporalType: string | null, granularity: string | null): boolean {
    if (granularity === null) {
      return true;
    }
    if (temporalType === 'xsd:date') {
      return ['year', 'month', 'day'].includes(granularity!);
    }
    if (temporalType === 'xsd:time') {
      return ['hour', 'minute', 'second', 'decimalSecond'].includes(granularity!);
    }
    return ['day', ...['hour', 'minute', 'second', 'decimalSecond']].includes(granularity!);
  }

  private static datePattern(granularity: string | null, allowPartial: boolean): RegExp {
    if (granularity === 'year') {
      return /^\d{4}$/;
    }
    if (granularity === 'month') {
      return /^\d{4}-(?:0[1-9]|1[0-2])$/;
    }
    if (granularity === 'day' || !allowPartial) {
      return /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
    }
    return /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/;
  }

  private static timePattern(granularity: string | null): RegExp {
    const zone = this.zone;
    const hour = this.hour;
    const minute = this.minute;
    const second = this.second;
    if (granularity === 'hour') {
      return new RegExp(`^${hour}${zone}$`);
    }
    if (granularity === 'minute') {
      return new RegExp(`^${hour}:${minute}${zone}$`);
    }
    if (granularity === 'second') {
      return new RegExp(`^${hour}:${minute}:${second}${zone}$`);
    }
    if (granularity === 'decimalSecond') {
      return new RegExp(`^${hour}:${minute}:${second}\\.\\d+${zone}$`);
    }
    return new RegExp(`^${hour}(?::${minute}(?::${second}(?:\\.\\d+)?)?)?${zone}$`);
  }

  private static dateTimePattern(granularity: string | null): RegExp {
    const date = '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])';
    if (granularity === 'hour' || granularity === 'minute' || granularity === 'second' || granularity === 'decimalSecond') {
      return new RegExp(`^${date}T${this.timePatternSource(granularity)}$`);
    }
    if (granularity === 'year' || granularity === 'month') {
      return /a^/;
    }
    if (granularity === 'day') {
      return new RegExp(`^${date}$`);
    }
    return new RegExp(`^${date}(?:T${this.timePatternSource(null)})?$`);
  }

  private static timePatternSource(granularity: string | null): string {
    return this.timePattern(granularity).source.replace(/^\^|\$$/g, '');
  }

  private static hasValidCalendarDate(value: string): boolean {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match === null) {
      return true;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day <= daysInMonth[month - 1];
  }
}
