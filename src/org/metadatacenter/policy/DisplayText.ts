/** Derived search/display text only. Never use these operations to rewrite an identifier or object key. */
export class DisplayText {
  private static readonly segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' });

  /** Locale-independent matching; canonical equivalents match without changing stored spelling. */
  public static searchKey(value: string): string {
    return Array.from(this.segmenter.segment(value), ({ segment }) => segment.normalize('NFC').toLowerCase()).join('');
  }

  /** Map a folded match back to the original graphemes, including expanding case mappings such as İ. */
  public static splitMatch(value: string, query: string): readonly [string, string, string] {
    const needle = this.searchKey(query);
    if (!needle) return [value, '', ''];
    let folded = '';
    const offsets: { start: number; end: number }[] = [];
    for (const { segment, index } of this.segmenter.segment(value)) {
      const key = segment.normalize('NFC').toLowerCase();
      folded += key;
      for (let i = 0; i < key.length; i++) offsets.push({ start: index, end: index + segment.length });
    }
    const at = folded.indexOf(needle);
    if (at < 0) return [value, '', ''];
    const start = offsets[at].start,
      end = offsets[at + needle.length - 1].end;
    return [value.slice(0, start), value.slice(start, end), value.slice(end)];
  }

  /** Middle elision counts graphemes; it never splits a surrogate pair, accent or joined emoji. */
  public static elide(value: string, max = 96, tail = 28): string {
    const parts = Array.from(this.segmenter.segment(value), ({ segment }) => segment);
    const budget = Math.max(1, Math.trunc(max));
    if (parts.length <= budget) return value;
    const suffix = Math.max(0, Math.min(Math.trunc(tail), budget - 1));
    return `${parts
      .slice(0, budget - suffix - 1)
      .join('')
      .trimEnd()}…${suffix ? parts.slice(-suffix).join('').trimStart() : ''}`;
  }
}
