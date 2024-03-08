import { SchemaVersion } from '../../../types/beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../types/beans/CedarFieldType';
import { CedarArtifactType } from '../../../types/beans/CedarArtifactType';

export class CedarStaticPageBreakField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_PAGE_BREAK;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarStaticPageBreakField {
    return new CedarStaticPageBreakField();
  }

  public static buildEmptyWithDefaultValues(): CedarStaticPageBreakField {
    const r = new CedarStaticPageBreakField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
