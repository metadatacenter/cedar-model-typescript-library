import { SchemaVersion } from '../../beans/SchemaVersion';
import { CedarField } from '../CedarField';
import { CedarFieldType } from '../../beans/CedarFieldType';
import { ValueConstraintsLinkField } from './ValueConstraintsLinkField';

export class CedarLinkField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.LINK;
    this.valueConstraints = new ValueConstraintsLinkField();
  }

  public static buildEmptyWithNullValues(): CedarLinkField {
    return new CedarLinkField();
  }

  public static buildEmptyWithDefaultValues(): CedarLinkField {
    const r = new CedarLinkField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
