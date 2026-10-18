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
}
