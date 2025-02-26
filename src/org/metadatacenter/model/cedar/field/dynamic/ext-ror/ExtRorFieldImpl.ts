import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ExtRorField } from './ExtRorField';

export class ExtRorFieldImpl extends TemplateField implements ExtRorField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EXT_ROR;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraints();
  }

  public static buildEmpty(): ExtRorField {
    return new ExtRorFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
