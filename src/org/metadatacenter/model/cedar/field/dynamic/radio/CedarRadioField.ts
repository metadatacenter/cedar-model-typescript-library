import { SchemaVersion } from '../../../beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../beans/CedarFieldType';
import { CedarArtifactType } from '../../../beans/CedarArtifactType';
import { ValueConstraintsRadioField } from './ValueConstraintsRadioField';

export class CedarRadioField extends CedarField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsRadioField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.RADIO;
    this.valueConstraints = new ValueConstraintsRadioField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarRadioField {
    return new CedarRadioField();
  }

  public static buildEmptyWithDefaultValues(): CedarRadioField {
    const r = new CedarRadioField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
