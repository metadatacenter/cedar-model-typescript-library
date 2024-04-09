import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsRadioField } from './ValueConstraintsRadioField';
import { RadioField } from './RadioField';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysSingleBuilder';

export class RadioFieldImpl extends TemplateField implements RadioField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsRadioField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.RADIO;
    this.valueConstraints = new ValueConstraintsRadioField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): RadioField {
    return new RadioFieldImpl();
  }

  override isSingleInstanceByDefinition(): boolean {
    return true;
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysSingleBuilder {
    return new ChildDeploymentInfoAlwaysSingleBuilder(this, childName);
  }
}
