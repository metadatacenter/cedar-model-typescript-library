export class MapOfStringToString extends Map<string, string> {
  toJSON(): Record<string, string> {
    return Object.fromEntries(this);
  }
}
