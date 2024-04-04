import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { AbstractInstanceArtifact } from '../AbstractInstanceArtifact';

export class TemplateInstance extends AbstractInstanceArtifact {
  private constructor() {
    super();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_INSTANCE;
  }

  public static buildEmptyWithNullValues(): TemplateInstance {
    return new TemplateInstance();
  }
}
