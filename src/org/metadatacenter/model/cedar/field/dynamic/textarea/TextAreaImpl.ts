import { TemplateField } from '../../TemplateField';
import { TextArea } from './TextArea';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ValueConstraintsTextArea } from './ValueConstraintsTextArea';

export class TextAreaImpl extends TemplateField implements TextArea {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsTextArea;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.TEXTAREA;
    this.valueConstraints = new ValueConstraintsTextArea();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): TextArea {
    return new TextAreaImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
