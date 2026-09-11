import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsIriField } from '../../ValueConstraintsIriField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ExtOrcidField } from './ExtOrcidField';

export class ExtOrcidFieldImpl extends TemplateField implements ExtOrcidField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsIriField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EXT_ORCID;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraintsIriField();
  }

  public static buildEmpty(): ExtOrcidField {
    return new ExtOrcidFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
