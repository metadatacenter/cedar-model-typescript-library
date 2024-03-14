import { SchemaVersion } from '../../../types/beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../types/beans/CedarFieldType';
import { CedarArtifactType } from '../../../types/beans/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';

export class CedarLinkField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.LINK;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraints();
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
