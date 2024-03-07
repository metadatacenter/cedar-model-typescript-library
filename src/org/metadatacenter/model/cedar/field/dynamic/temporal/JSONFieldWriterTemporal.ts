import { JsonNode } from '../../../util/types/JsonNode';
import { CedarModel } from '../../../CedarModel';
import { TimeFormat } from '../../../beans/TimeFormat';
import { TemporalGranularity } from '../../../beans/TemporalGranularity';
import { CedarTemporalField } from './CedarTemporalField';
import { JSONFieldWriter } from '../../JSONFieldWriter';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';

export class JSONFieldWriterTemporal extends JSONFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandUINodeForJSON(uiNode: JsonNode, field: CedarTemporalField): void {
    if (field.timezoneEnabled) {
      uiNode[CedarModel.timezoneEnabled] = field.timezoneEnabled;
    }
    if (field.inputTimeFormat !== TimeFormat.NULL) {
      uiNode[CedarModel.inputTimeFormat] = this.atomicWriter.write(field.inputTimeFormat);
    }
    if (field.temporalGranularity !== TemporalGranularity.NULL) {
      uiNode[CedarModel.temporalGranularity] = this.atomicWriter.write(field.temporalGranularity);
    }
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarTemporalField): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field);
    vcNode[CedarModel.temporalType] = this.atomicWriter.write(field.valueConstraints.temporalType);
  }
}
