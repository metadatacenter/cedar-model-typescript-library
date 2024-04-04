import { CedarJSONReaders } from './json/CedarJSONReaders';
import { CedarYAMLReaders } from './yaml/CedarYAMLReaders';

export abstract class CedarReaders {
  private constructor() {}

  public static json(): typeof CedarJSONReaders {
    return CedarJSONReaders;
  }

  public static yaml(): typeof CedarYAMLReaders {
    return CedarYAMLReaders;
  }
}
