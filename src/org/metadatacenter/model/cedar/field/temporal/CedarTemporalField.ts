import { SchemaVersion } from '../../beans/SchemaVersion';
import { CedarField } from '../CedarField';
import { CedarFieldType } from '../../beans/CedarFieldType';
import { CedarArtifactType } from '../../beans/CedarArtifactType';
import { ValueConstraintsTemporalField } from './ValueConstraintsTemporalField';
import { Node } from '../../util/types/Node';
import { CedarModel } from '../../CedarModel';

export class CedarTemporalField extends CedarField {
  public timezoneEnabled: boolean = false;
  public inputTimeFormat: string | null = null;
  public temporalGranularity: string | null = null;
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.TEMPORAL;
    this.valueConstraints = new ValueConstraintsTemporalField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarTemporalField {
    return new CedarTemporalField();
  }

  public static buildEmptyWithDefaultValues(): CedarTemporalField {
    const r = new CedarTemporalField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }

  protected expandUINodeForJSON(uiNode: Node): void {
    if (this.timezoneEnabled) {
      uiNode[CedarModel.timezoneEnabled] = this.timezoneEnabled;
    }
    if (this.inputTimeFormat !== null) {
      uiNode[CedarModel.inputTimeFormat] = this.inputTimeFormat;
    }
    if (this.temporalGranularity !== null) {
      uiNode[CedarModel.temporalGranularity] = this.temporalGranularity;
    }
  }
}
