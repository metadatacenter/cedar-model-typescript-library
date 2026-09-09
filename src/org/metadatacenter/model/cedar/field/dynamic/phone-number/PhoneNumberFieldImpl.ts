import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsLiteralField } from '../../ValueConstraintsLiteralField';
import { PhoneNumberField } from './PhoneNumberField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export class PhoneNumberFieldImpl extends TemplateField implements PhoneNumberField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsLiteralField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.PHONE_NUMBER;
    this.valueConstraints = new ValueConstraintsLiteralField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): PhoneNumberField {
    return new PhoneNumberFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
