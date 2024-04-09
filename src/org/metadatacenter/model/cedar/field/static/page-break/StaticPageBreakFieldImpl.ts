import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { StaticPageBreakField } from './StaticPageBreakField';
import { ChildDeploymentInfoStaticBuilder } from '../../../deployment/ChildDeploymentInfoStaticBuilder';

export class StaticPageBreakFieldImpl extends TemplateField implements StaticPageBreakField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_PAGE_BREAK;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmpty(): StaticPageBreakField {
    return new StaticPageBreakFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoStaticBuilder {
    return new ChildDeploymentInfoStaticBuilder(this, childName);
  }
}
