import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';

export class StaticRichTextField extends TemplateField {
  public content: string | null = null;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_RICH_TEXT;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): StaticRichTextField {
    return new StaticRichTextField();
  }

  public static buildEmptyWithDefaultValues(): StaticRichTextField {
    const r = new StaticRichTextField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
