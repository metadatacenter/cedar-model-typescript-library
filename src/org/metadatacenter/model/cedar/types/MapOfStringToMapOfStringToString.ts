import { MapOfStringToString } from './MapOfStringToString';

export class MapOfStringToMapOfStringToString extends Map<string, MapOfStringToString> {
  toJSON(): Record<string, Record<string, string>> {
    const obj: Record<string, Record<string, string>> = {};
    this.forEach((value, key) => {
      obj[key] = value.toJSON();
    });
    return obj;
  }
}
