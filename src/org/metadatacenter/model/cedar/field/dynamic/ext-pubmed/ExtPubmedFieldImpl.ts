import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsIriField } from '../../ValueConstraintsIriField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ExtPubmedField } from './ExtPubmedField';

export class ExtPubmedFieldImpl extends TemplateField implements ExtPubmedField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsIriField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EXT_PUBMED;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraintsIriField();
  }

  public static buildEmpty(): ExtPubmedField {
    return new ExtPubmedFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
