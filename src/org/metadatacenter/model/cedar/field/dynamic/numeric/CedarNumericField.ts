import { SchemaVersion } from '../../../types/beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../types/beans/CedarFieldType';
import { CedarArtifactType } from '../../../types/beans/CedarArtifactType';
import { ValueConstraintsNumericField } from './ValueConstraintsNumericField';

export class CedarNumericField extends CedarField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsNumericField;
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.NUMERIC;
    this.valueConstraints = new ValueConstraintsNumericField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarNumericField {
    return new CedarNumericField();
  }

  public static buildEmptyWithDefaultValues(): CedarNumericField {
    const r = new CedarNumericField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
