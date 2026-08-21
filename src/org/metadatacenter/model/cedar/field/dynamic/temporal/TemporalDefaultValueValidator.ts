import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';

export class TemporalDefaultValueValidator {
  private static readonly zone = '(?:Z|[+-](?:(?:0\\d|1[0-3]):[0-5]\\d|14:00))?';
  private static readonly hour = '(?:[01]\\d|2[0-3])';
  private static readonly minute = '[0-5]\\d';
  private static readonly second = '[0-5]\\d';

  public static assertValid(temporalType: TemporalType, granularity: TemporalGranularity, defaultValue: string | null): void {
    if (defaultValue === null || defaultValue === '') {
      return;
    }

    const type = temporalType.getValue();
    if (type === null) {
      throw new Error('Temporal default requires a temporal datatype.');
    }
    if (!this.isCompatibleGranularity(temporalType, granularity)) {
      throw new Error(`Temporal datatype ${type} is not compatible with ${granularity.getValue()} granularity.`);
    }

    const date = this.datePattern(granularity, type === TemporalType.DATE.getValue());
    const time = this.timePattern(granularity);
    let pattern: RegExp;
    if (type === TemporalType.DATE.getValue()) {
      pattern = date;
    } else if (type === TemporalType.TIME.getValue()) {
      pattern = time;
    } else {
      pattern = this.dateTimePattern(granularity);
    }

    if (!pattern.test(defaultValue) || !this.hasValidCalendarDate(defaultValue)) {
      throw new Error(
        `Temporal default "${defaultValue}" is not valid for ${type}` +
          (granularity.getValue() === null ? '.' : ` at ${granularity.getValue()} granularity.`),
      );
    }
  }

  private static isCompatibleGranularity(temporalType: TemporalType, granularity: TemporalGranularity): boolean {
    if (granularity === TemporalGranularity.NULL) {
      return true;
    }
    if (temporalType === TemporalType.DATE) {
      return [TemporalGranularity.YEAR, TemporalGranularity.MONTH, TemporalGranularity.DAY].includes(granularity);
    }
    if (temporalType === TemporalType.TIME) {
      return TemporalGranularity.valuesWithTimes().includes(granularity);
    }
    return [TemporalGranularity.DAY, ...TemporalGranularity.valuesWithTimes()].includes(granularity);
  }

  private static datePattern(granularity: TemporalGranularity, allowPartial: boolean): RegExp {
    if (granularity === TemporalGranularity.YEAR) {
      return /^\d{4}$/;
    }
    if (granularity === TemporalGranularity.MONTH) {
      return /^\d{4}-(?:0[1-9]|1[0-2])$/;
    }
    if (granularity === TemporalGranularity.DAY || !allowPartial) {
      return /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
    }
    return /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/;
  }

  private static timePattern(granularity: TemporalGranularity): RegExp {
    const zone = this.zone;
    const hour = this.hour;
    const minute = this.minute;
    const second = this.second;
    if (granularity === TemporalGranularity.HOUR) {
      return new RegExp(`^${hour}${zone}$`);
    }
    if (granularity === TemporalGranularity.MINUTE) {
      return new RegExp(`^${hour}:${minute}${zone}$`);
    }
    if (granularity === TemporalGranularity.SECOND) {
      return new RegExp(`^${hour}:${minute}:${second}${zone}$`);
    }
    if (granularity === TemporalGranularity.DECIMAL_SECOND) {
      return new RegExp(`^${hour}:${minute}:${second}\\.\\d+${zone}$`);
    }
    return new RegExp(`^${hour}(?::${minute}(?::${second}(?:\\.\\d+)?)?)?${zone}$`);
  }

  private static dateTimePattern(granularity: TemporalGranularity): RegExp {
    const date = '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])';
    if (
      granularity === TemporalGranularity.HOUR ||
      granularity === TemporalGranularity.MINUTE ||
      granularity === TemporalGranularity.SECOND ||
      granularity === TemporalGranularity.DECIMAL_SECOND
    ) {
      return new RegExp(`^${date}T${this.timePatternSource(granularity)}$`);
    }
    if (granularity === TemporalGranularity.YEAR || granularity === TemporalGranularity.MONTH) {
      return /a^/;
    }
    if (granularity === TemporalGranularity.DAY) {
      return new RegExp(`^${date}$`);
    }
    return new RegExp(`^${date}(?:T${this.timePatternSource(TemporalGranularity.NULL)})?$`);
  }

  private static timePatternSource(granularity: TemporalGranularity): string {
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
