import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { TimeFormat } from '../../../types/beans/TimeFormat';
import { TemporalGranularity } from '../../../types/beans/TemporalGranularity';
import { CedarTemporalField } from './CedarTemporalField';
import { JSONFieldWriter } from '../../../../../io/writer/JSONFieldWriter';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

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

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarTemporalField, childInfo: CedarContainerChildInfo): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    vcNode[CedarModel.temporalType] = this.atomicWriter.write(field.valueConstraints.temporalType);
  }
}
