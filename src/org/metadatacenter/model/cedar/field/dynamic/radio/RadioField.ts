import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsRadioField } from './ValueConstraintsRadioField';

export class RadioField extends TemplateField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsRadioField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.RADIO;
    this.valueConstraints = new ValueConstraintsRadioField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): RadioField {
    return new RadioField();
  }

  public static buildEmptyWithDefaultValues(): RadioField {
    const r = new RadioField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
