import { SchemaVersion } from '../../../types/beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../types/beans/CedarFieldType';
import { CedarArtifactType } from '../../../types/beans/CedarArtifactType';

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
