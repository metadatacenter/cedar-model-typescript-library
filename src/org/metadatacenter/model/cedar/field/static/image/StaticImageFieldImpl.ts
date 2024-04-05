import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { StaticImageField } from './StaticImageField';

export class StaticImageFieldImpl extends TemplateField implements StaticImageField {
  public content: string | null = null;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_IMAGE;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmpty(): StaticImageField {
    return new StaticImageFieldImpl();
  }
}
