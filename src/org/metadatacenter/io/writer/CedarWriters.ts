import { CedarJSONWriters } from './json/CedarJSONWriters';
import { CedarYAMLWriters } from './yaml/CedarYAMLWriters';

export abstract class CedarWriters {
  private constructor() {}

  public static json(): typeof CedarJSONWriters {
    return CedarJSONWriters;
  }

  public static yaml(): typeof CedarYAMLWriters {
    return CedarYAMLWriters;
  }
}
