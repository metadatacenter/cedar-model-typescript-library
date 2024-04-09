import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { StaticSectionBreakField } from './StaticSectionBreakField';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysSingleBuilder';

export class StaticSectionBreakFieldImpl extends TemplateField implements StaticSectionBreakField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_SECTION_BREAK;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmpty(): StaticSectionBreakField {
    return new StaticSectionBreakFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysSingleBuilder {
    return new ChildDeploymentInfoAlwaysSingleBuilder(this, childName);
  }
}
