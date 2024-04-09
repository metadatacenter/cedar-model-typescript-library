import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsNumericField } from './ValueConstraintsNumericField';
import { NumericField } from './NumericField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export class NumericFieldImpl extends TemplateField implements NumericField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsNumericField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.NUMERIC;
    this.valueConstraints = new ValueConstraintsNumericField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): NumericField {
    return new NumericFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
