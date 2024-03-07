import { SchemaVersion } from '../../beans/SchemaVersion';
import { CedarField } from '../CedarField';
import { CedarFieldType } from '../../beans/CedarFieldType';
import { CedarArtifactType } from '../../beans/CedarArtifactType';
import { ValueConstraintsEmailField } from './ValueConstraintsEmailField';

export class CedarEmailField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EMAIL;
    this.valueConstraints = new ValueConstraintsEmailField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarEmailField {
    return new CedarEmailField();
  }

  public static buildEmptyWithDefaultValues(): CedarEmailField {
    const r = new CedarEmailField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
