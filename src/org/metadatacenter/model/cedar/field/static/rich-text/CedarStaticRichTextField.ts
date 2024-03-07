import { SchemaVersion } from '../../../beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../beans/CedarFieldType';
import { CedarArtifactType } from '../../../beans/CedarArtifactType';

export class CedarStaticRichTextField extends CedarField {
  public content: string | null = null;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_RICH_TEXT;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarStaticRichTextField {
    return new CedarStaticRichTextField();
  }

  public static buildEmptyWithDefaultValues(): CedarStaticRichTextField {
    const r = new CedarStaticRichTextField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
