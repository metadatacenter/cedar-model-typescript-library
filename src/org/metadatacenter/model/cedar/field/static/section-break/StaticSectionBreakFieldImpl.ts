import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { StaticSectionBreakField } from './StaticSectionBreakField';
import { ChildDeploymentInfoStaticBuilder } from '../../../deployment/ChildDeploymentInfoStaticBuilder';

export class StaticSectionBreakFieldImpl extends TemplateField implements StaticSectionBreakField {
  /**
   * The text the break carries. Its `_ui._content` is what the meta-schema asks of every
   * static field, and the model had nowhere to keep it, so a break read from either
   * serialization came back blank and was written out blank.
   */
  public content: string | null = null;

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
