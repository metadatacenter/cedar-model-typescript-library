import { TemplateField } from '../../TemplateField';
import { ValueConstraintsTextField } from './ValueConstraintsTextField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { TextField } from './TextField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export class TextFieldImpl extends TemplateField implements TextField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsTextField;

  public valueRecommendationEnabled: boolean = false;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.TEXT;
    this.valueConstraints = new ValueConstraintsTextField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): TextField {
    return new TextFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }

  override supportsValueRecommendation(): boolean {
    return true;
  }
}
