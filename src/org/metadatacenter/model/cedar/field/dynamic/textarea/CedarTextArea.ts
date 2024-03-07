import { SchemaVersion } from '../../../beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../beans/CedarFieldType';
import { CedarArtifactType } from '../../../beans/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';

export class CedarTextArea extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.TEXTAREA;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarTextArea {
    return new CedarTextArea();
  }

  public static buildEmptyWithDefaultValues(): CedarTextArea {
    const r = new CedarTextArea();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
