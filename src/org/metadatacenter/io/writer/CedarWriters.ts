import { CedarJsonWriters } from './json/CedarJsonWriters';
import { CedarYamlWriters } from './yaml/CedarYamlWriters';

export abstract class CedarWriters {
  private constructor() {}

  public static json(): typeof CedarJsonWriters {
    return CedarJsonWriters;
  }

  public static yaml(): typeof CedarYamlWriters {
    return CedarYamlWriters;
  }
}
