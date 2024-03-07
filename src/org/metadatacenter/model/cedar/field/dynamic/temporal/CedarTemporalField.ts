import { SchemaVersion } from '../../../beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../beans/CedarFieldType';
import { CedarArtifactType } from '../../../beans/CedarArtifactType';
import { ValueConstraintsTemporalField } from './ValueConstraintsTemporalField';
import { JsonNode } from '../../../util/types/JsonNode';
import { CedarModel } from '../../../CedarModel';
import { TimeFormat } from '../../../beans/TimeFormat';
import { TemporalGranularity } from '../../../beans/TemporalGranularity';

export class CedarTemporalField extends CedarField {
  public timezoneEnabled: boolean = false;
  public inputTimeFormat: TimeFormat = TimeFormat.NULL;
  public temporalGranularity: TemporalGranularity = TemporalGranularity.NULL;
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

  protected expandUINodeForJSON(uiNode: JsonNode): void {
    if (this.timezoneEnabled) {
      uiNode[CedarModel.timezoneEnabled] = this.timezoneEnabled;
    }
    if (this.inputTimeFormat !== TimeFormat.NULL) {
      uiNode[CedarModel.inputTimeFormat] = this.inputTimeFormat;
    }
    if (this.temporalGranularity !== TemporalGranularity.NULL) {
      uiNode[CedarModel.temporalGranularity] = this.temporalGranularity;
    }
  }
}
