import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalField } from './TemporalField';
import { JSONTemplateFieldWriterInternal } from '../../../../../io/writer/json/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJSONWriters } from '../../../../../io/writer/json/CedarJSONWriters';

export class JSONFieldWriterTemporal extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  override expandUINodeForJSON(uiNode: JsonNode, field: TemporalField, childInfo: ChildDeploymentInfo): void {
    super.expandUINodeForJSON(uiNode, field, childInfo);
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

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: TemporalField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    vcNode[CedarModel.temporalType] = this.atomicWriter.write(field.valueConstraints.temporalType);
  }
}
