/** Provenance timestamps. Partial temporal field values have a separate contract. */
export class TimestampPolicy {
  public static canonical(value: string): string {
    const normalized = value.replace(/([+-][0-9]{2})([0-9]{2})$/, '$1:$2');
    const match =
      /^(\d{4}|-\d{4,9}|\+\d{5,9})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?([Zz]|[+-]\d{2}(?::\d{2}(?::\d{2})?)?)$/.exec(
        normalized,
      );
    if (!match) throw new Error('Expected an ISO timestamp with an explicit offset.');
    const [, yearText, monthText, dayText, hourText, minuteText, secondText = '00', fraction = '', zone] = match;
    const year = Number(yearText),
      month = Number(monthText),
      day = Number(dayText);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (
      (year === 0 && yearText.startsWith('-')) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > days[month - 1] ||
      Number(hourText) > 23 ||
      Number(minuteText) > 59 ||
      Number(secondText) > 59
    )
      throw new Error('Invalid timestamp calendar or clock value.');
    let offset = 'Z';
    if (zone.toUpperCase() !== 'Z') {
      const [hours, minutes = 0, seconds = 0] = zone.slice(1).split(':').map(Number);
      if (hours > 18 || minutes > 59 || seconds > 59 || (hours === 18 && (minutes !== 0 || seconds !== 0)))
        throw new Error('Timestamp offset is outside the ISO offset range.');
      if (hours || minutes || seconds) {
        offset = `${zone[0]}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        if (seconds) offset += `:${String(seconds).padStart(2, '0')}`;
      }
    }
    const digits = String(Math.abs(year)).padStart(4, '0');
    const canonicalYear = (year < 0 ? '-' : year > 9999 ? '+' : '') + digits;
    const significantFraction = fraction.replace(/0+$/, '');
    return `${canonicalYear}-${monthText}-${dayText}T${hourText}:${minuteText}:${secondText}${significantFraction ? '.' + significantFraction : ''}${offset}`;
  }

  /**
   * Whether the `date-time` format the meta-schemas name admits a value, as the
   * server's validator checks it. That check resolves a value leniently rather
   * than reading it as a calendar: any month takes a day up to 31, and
   * `24:00:00` is the next midnight. It wants a four-digit year from 0001, or a
   * longer one after `+`, seconds, a fraction of one to nine digits, and an
   * offset of `Z`, `±HH:MM`, `±HH:MM:SS` or `±HHMM` no further than 18 hours.
   * The model reads a provenance timestamp more strictly in some respects and
   * less in others, so a stored one must satisfy both.
   */
  public static matchesFormat(value: string): boolean {
    const match =
      /^(\d{4}|\+\d{5,9})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2})(?::(\d{2})(?::(\d{2}))?|(\d{2})))$/.exec(
        value,
      );
    if (match === null) return false;
    const [, year, month, day, hour, minute, second, fraction = '', , , offsetHours, colonMinutes, offsetSeconds, bareMinutes] = match;
    const clock = Number(hour) < 24 || (minute === '00' && second === '00' && /^0*$/.test(fraction));
    const offset = [offsetHours, colonMinutes ?? bareMinutes, offsetSeconds].map((part) => Number(part ?? 0));
    return (
      Number(year) >= 1 &&
      Number(month) >= 1 &&
      Number(month) <= 12 &&
      Number(day) >= 1 &&
      Number(day) <= 31 &&
      clock &&
      Number(hour) <= 24 &&
      Number(minute) <= 59 &&
      Number(second) <= 59 &&
      offset[1] <= 59 &&
      offset[2] <= 59 &&
      offset[0] * 3600 + offset[1] * 60 + offset[2] <= 18 * 3600
    );
  }
}
