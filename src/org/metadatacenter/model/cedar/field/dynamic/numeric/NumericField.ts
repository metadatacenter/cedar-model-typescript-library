import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsNumericField } from './ValueConstraintsNumericField';

export class NumericField extends TemplateField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsNumericField;
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.NUMERIC;
    this.valueConstraints = new ValueConstraintsNumericField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): NumericField {
    return new NumericField();
  }

  public static buildEmptyWithDefaultValues(): NumericField {
    const r = new NumericField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
