export class CedarTemplateRequiredList {
  private builtInNodeNames: Array<string> = [];
  private cedarArtifacts: Array<string> = [];

  private constructor() {}

  public static EMPTY = new CedarTemplateRequiredList();
}
