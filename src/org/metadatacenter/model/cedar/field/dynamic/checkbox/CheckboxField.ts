import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsCheckboxField } from './ValueConstraintsCheckboxField';

export class CheckboxField extends TemplateField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsCheckboxField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.CHECKBOX;
    this.valueConstraints = new ValueConstraintsCheckboxField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CheckboxField {
    return new CheckboxField();
  }

  public static buildEmptyWithDefaultValues(): CheckboxField {
    const r = new CheckboxField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
