import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsIriField } from '../../ValueConstraintsIriField';
import { LinkField } from './LinkField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export class LinkFieldImpl extends TemplateField implements LinkField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsIriField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.LINK;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraintsIriField();
  }

  public static buildEmpty(): LinkField {
    return new LinkFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
