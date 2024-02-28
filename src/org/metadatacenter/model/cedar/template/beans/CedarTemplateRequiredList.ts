import { JsonSchema } from '../../constants/JsonSchema';

export class CedarTemplateRequiredList {
  private builtInNames: Array<string> = [];
  private cedarArtifactNames: Array<string> = [];

  private constructor() {}

  public static EMPTY = new CedarTemplateRequiredList();

  toJSON() {
    return [...this.builtInNames, ...this.cedarArtifactNames];
  }

  static fromList(inputList: Array<string>): CedarTemplateRequiredList {
    const r = new CedarTemplateRequiredList();
    for (const name of inputList) {
      if (JsonSchema.builtInProperties.has(name)) {
        r.builtInNames.push(name);
      } else {
        r.cedarArtifactNames.push(name);
      }
    }
    return r;
  }
}
