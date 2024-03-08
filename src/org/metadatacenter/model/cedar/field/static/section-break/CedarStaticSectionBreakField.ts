import { SchemaVersion } from '../../../types/beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../types/beans/CedarFieldType';
import { CedarArtifactType } from '../../../types/beans/CedarArtifactType';

export class CedarStaticSectionBreakField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_SECTION_BREAK;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarStaticSectionBreakField {
    return new CedarStaticSectionBreakField();
  }

  public static buildEmptyWithDefaultValues(): CedarStaticSectionBreakField {
    const r = new CedarStaticSectionBreakField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
