import { SchemaVersion } from '../../../types/beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { ValueConstraintsControlledTermField } from './ValueConstraintsControlledTermField';
import { CedarFieldType } from '../../../types/beans/CedarFieldType';
import { CedarArtifactType } from '../../../types/beans/CedarArtifactType';

export class CedarControlledTermField extends CedarField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsControlledTermField;

  public valueRecommendationEnabled: boolean = false;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.CONTROLLED_TERM;
    this.valueConstraints = new ValueConstraintsControlledTermField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarControlledTermField {
    return new CedarControlledTermField();
  }

  public static buildEmptyWithDefaultValues(): CedarControlledTermField {
    const r = new CedarControlledTermField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
