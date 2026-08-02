import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ExtDoiField } from './ExtDoiField';

export class ExtDoiFieldImpl extends TemplateField implements ExtDoiField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EXT_DOI;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraints();
  }

  public static buildEmpty(): ExtDoiField {
    return new ExtDoiFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
