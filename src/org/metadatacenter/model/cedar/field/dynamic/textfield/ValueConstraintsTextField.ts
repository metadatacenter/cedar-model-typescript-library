import { ValueConstraints } from '../../ValueConstraints';
import { CedarModel } from '../../../CedarModel';
import { Node } from '../../../util/types/Node';

export class ValueConstraintsTextField extends ValueConstraints {
  public defaultValue: string | null = null;
  public minLength: number | null = null;
  public maxLength: number | null = null;
  public regex: string | null = null;

  public constructor() {
    super();
  }

  public toJSON(): Node {
    const obj: Node = {
      [CedarModel.requiredValue]: this.requiredValue,
    };
    if (this.defaultValue != null) {
      obj[CedarModel.defaultValue] = this.defaultValue;
    }
    if (this.minLength != null) {
      obj[CedarModel.minLength] = this.minLength;
    }
    if (this.maxLength != null) {
      obj[CedarModel.maxLength] = this.maxLength;
    }
    if (this.regex != null) {
      obj[CedarModel.regex] = this.regex;
    }
    return obj;
  }
}
