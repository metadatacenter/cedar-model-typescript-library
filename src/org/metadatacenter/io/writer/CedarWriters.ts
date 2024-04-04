import { CedarJsonWriters } from './json/CedarJsonWriters';
import { CedarYAMLWriters } from './yaml/CedarYAMLWriters';

export abstract class CedarWriters {
  private constructor() {}

  public static json(): typeof CedarJsonWriters {
    return CedarJsonWriters;
  }

  public static yaml(): typeof CedarYAMLWriters {
    return CedarYAMLWriters;
  }
}
