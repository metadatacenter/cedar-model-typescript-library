import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';

export class PhoneNumberField extends TemplateField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.PHONE_NUMBER;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): PhoneNumberField {
    return new PhoneNumberField();
  }

  public static buildEmptyWithDefaultValues(): PhoneNumberField {
    const r = new PhoneNumberField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
