import { TemplateField } from './TemplateField';
import { CedarFieldType } from '../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { ChildDeploymentInfoBuilder } from '../deployment/ChildDeploymentInfoBuilder';

export class UnknownTemplateField extends TemplateField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.NULL;
    this.cedarArtifactType = CedarArtifactType.NULL;
  }

  public static build(): UnknownTemplateField {
    return new UnknownTemplateField();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
