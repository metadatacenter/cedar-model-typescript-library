import { CedarJsonReaders } from './json/CedarJsonReaders';
import { CedarYAMLReaders } from './yaml/CedarYAMLReaders';

export abstract class CedarReaders {
  private constructor() {}

  public static json(): typeof CedarJsonReaders {
    return CedarJsonReaders;
  }

  public static yaml(): typeof CedarYAMLReaders {
    return CedarYAMLReaders;
  }
}
