import { SchemaVersion } from '../../../types/beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../types/beans/CedarFieldType';
import { CedarArtifactType } from '../../../types/beans/CedarArtifactType';
import { ValueConstraintsListField } from './ValueConstraintsListField';

export class CedarListField extends CedarField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsListField;
  public multipleChoice: boolean;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.LIST;
    this.valueConstraints = new ValueConstraintsListField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.multipleChoice = false;
  }

  public static buildEmptyWithNullValues(): CedarListField {
    return new CedarListField();
  }

  public static buildEmptyWithDefaultValues(): CedarListField {
    const r = new CedarListField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
