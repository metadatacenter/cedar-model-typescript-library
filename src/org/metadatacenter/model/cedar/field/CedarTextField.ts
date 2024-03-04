import { SchemaVersion } from '../beans/SchemaVersion';
import { CedarField } from './CedarField';
import { ValueConstraintsTextField } from './ValueConstraintsTextField';
import { CedarFieldType } from '../beans/CedarFieldType';

export class CedarTextField extends CedarField {
  public valueRecommendationEnabled: boolean = false;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.TEXT;
    this.valueConstraints = new ValueConstraintsTextField();
  }

  public static buildEmptyWithNullValues(): CedarTextField {
    return new CedarTextField();
  }

  public static buildEmptyWithDefaultValues(): CedarTextField {
    const r = new CedarTextField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }

  getValueRecommendationEnabled(): boolean {
    return this.valueRecommendationEnabled;
  }
}
