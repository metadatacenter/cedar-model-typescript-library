import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ValueConstraintsBooleanField } from './ValueConstraintsBooleanField';
import { BooleanField } from './BooleanField';

export class BooleanFieldImpl extends TemplateField implements BooleanField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsBooleanField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.BOOLEAN;
    this.valueConstraints = new ValueConstraintsBooleanField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): BooleanField {
    return new BooleanFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
