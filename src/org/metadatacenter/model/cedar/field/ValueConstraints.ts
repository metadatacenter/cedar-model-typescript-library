import { CedarModel } from '../CedarModel';

export class ValueConstraints {
  public requiredValue: boolean = false;

  public constructor() {}

  public toJSON(): Record<string, any> {
    return {
      [CedarModel.requiredValue]: this.requiredValue,
    };
  }
}
