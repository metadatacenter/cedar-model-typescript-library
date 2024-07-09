import { TemplateField } from '../../TemplateField';
import { ValueConstraintsControlledTermField } from './ValueConstraintsControlledTermField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ControlledTermField } from './ControlledTermField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export class ControlledTermFieldImpl extends TemplateField implements ControlledTermField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsControlledTermField;

  public valueRecommendationEnabled: boolean = false;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.CONTROLLED_TERM;
    this.valueConstraints = new ValueConstraintsControlledTermField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): ControlledTermField {
    return new ControlledTermFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }

  override supportsValueRecommendation(): boolean {
    return true;
  }
}
