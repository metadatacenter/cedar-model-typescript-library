import { SchemaVersion } from '../../../beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../beans/CedarFieldType';
import { CedarArtifactType } from '../../../beans/CedarArtifactType';

export class CedarStaticImageField extends CedarField {
  public content: string | null = null;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_IMAGE;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarStaticImageField {
    return new CedarStaticImageField();
  }

  public static buildEmptyWithDefaultValues(): CedarStaticImageField {
    const r = new CedarStaticImageField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
