import { CedarJsonReaders } from './json/CedarJsonReaders';
import { CedarYamlReaders } from './yaml/CedarYamlReaders';

export abstract class CedarReaders {
  private constructor() {}

  public static json(): typeof CedarJsonReaders {
    return CedarJsonReaders;
  }

  public static yaml(): typeof CedarYamlReaders {
    return CedarYamlReaders;
  }
}
