import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { StaticSectionBreakField } from './StaticSectionBreakField';
import { ChildDeploymentInfoStaticBuilder } from '../../../deployment/ChildDeploymentInfoStaticBuilder';

export class StaticSectionBreakFieldImpl extends TemplateField implements StaticSectionBreakField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_SECTION_BREAK;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmpty(): StaticSectionBreakField {
    return new StaticSectionBreakFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoStaticBuilder {
    return new ChildDeploymentInfoStaticBuilder(this, childName);
  }
}
