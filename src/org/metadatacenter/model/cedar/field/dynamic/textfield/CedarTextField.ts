import { SchemaVersion } from '../../../beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { ValueConstraintsTextField } from './ValueConstraintsTextField';
import { CedarFieldType } from '../../../beans/CedarFieldType';
import { CedarArtifactType } from '../../../beans/CedarArtifactType';

export class CedarTextField extends CedarField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsTextField;

  public valueRecommendationEnabled: boolean = false;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.TEXT;
    this.valueConstraints = new ValueConstraintsTextField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarTextField {
    return new CedarTextField();
  }

  public static buildEmptyWithDefaultValues(): CedarTextField {
    const r = new CedarTextField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
