import { SchemaVersion } from '../../../types/beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../types/beans/CedarFieldType';
import { CedarArtifactType } from '../../../types/beans/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';

export class CedarAttributeValueField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.ATTRIBUTE_VALUE;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarAttributeValueField {
    return new CedarAttributeValueField();
  }

  public static buildEmptyWithDefaultValues(): CedarAttributeValueField {
    const r = new CedarAttributeValueField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
