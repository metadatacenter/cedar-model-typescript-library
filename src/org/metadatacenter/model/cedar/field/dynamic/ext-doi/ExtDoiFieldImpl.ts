import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsIriField } from '../../ValueConstraintsIriField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ExtDoiField } from './ExtDoiField';

export class ExtDoiFieldImpl extends TemplateField implements ExtDoiField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsIriField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EXT_DOI;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraintsIriField();
  }

  public static buildEmpty(): ExtDoiField {
    return new ExtDoiFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
