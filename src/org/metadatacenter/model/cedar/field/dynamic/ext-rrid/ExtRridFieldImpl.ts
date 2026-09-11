import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsIriField } from '../../ValueConstraintsIriField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ExtRridField } from './ExtRridField';

export class ExtRridFieldImpl extends TemplateField implements ExtRridField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsIriField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EXT_RRID;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraintsIriField();
  }

  public static buildEmpty(): ExtRridField {
    return new ExtRridFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
