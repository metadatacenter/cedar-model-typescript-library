import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { StaticPageBreakField } from './StaticPageBreakField';
import { ChildDeploymentInfoStaticBuilder } from '../../../deployment/ChildDeploymentInfoStaticBuilder';

export class StaticPageBreakFieldImpl extends TemplateField implements StaticPageBreakField {
  /**
   * The text the break carries. Its `_ui._content` is what the meta-schema asks of every
   * static field, and the model had nowhere to keep it, so a break read from either
   * serialization came back blank and was written out blank.
   */
  public content: string | null = null;

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
