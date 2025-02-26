import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ExtOrcidField } from './ExtOrcidField';

export class ExtOrcidFieldImpl extends TemplateField implements ExtOrcidField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EXT_ORCID;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraints();
  }

  public static buildEmpty(): ExtOrcidField {
    return new ExtOrcidFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
