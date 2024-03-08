import { SchemaVersion } from '../../../types/beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../types/beans/CedarFieldType';
import { CedarArtifactType } from '../../../types/beans/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';

export class CedarPhoneNumberField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.PHONE_NUMBER;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarPhoneNumberField {
    return new CedarPhoneNumberField();
  }

  public static buildEmptyWithDefaultValues(): CedarPhoneNumberField {
    const r = new CedarPhoneNumberField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
