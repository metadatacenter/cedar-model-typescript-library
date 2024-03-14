import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';

export class StaticImageField extends TemplateField {
  public content: string | null = null;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_IMAGE;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): StaticImageField {
    return new StaticImageField();
  }

  public static buildEmptyWithDefaultValues(): StaticImageField {
    const r = new StaticImageField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
