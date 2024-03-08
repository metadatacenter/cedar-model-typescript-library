import { SchemaVersion } from '../../../types/beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../types/beans/CedarFieldType';
import { CedarArtifactType } from '../../../types/beans/CedarArtifactType';
import { ValueConstraintsCheckboxField } from './ValueConstraintsCheckboxField';

export class CedarCheckboxField extends CedarField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsCheckboxField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.CHECKBOX;
    this.valueConstraints = new ValueConstraintsCheckboxField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarCheckboxField {
    return new CedarCheckboxField();
  }

  public static buildEmptyWithDefaultValues(): CedarCheckboxField {
    const r = new CedarCheckboxField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
