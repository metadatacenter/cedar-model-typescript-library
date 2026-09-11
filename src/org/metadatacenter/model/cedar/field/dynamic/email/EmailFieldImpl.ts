import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsLiteralField } from '../../ValueConstraintsLiteralField';
import { EmailField } from './EmailField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export class EmailFieldImpl extends TemplateField implements EmailField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsLiteralField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EMAIL;
    this.valueConstraints = new ValueConstraintsLiteralField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): EmailField {
    return new EmailFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
