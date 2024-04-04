import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalField } from './TemporalField';
import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';

export class JsonFieldWriterTemporal extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  override expandUINode(uiNode: JsonNode, field: TemporalField, childInfo: ChildDeploymentInfo): void {
    super.expandUINode(uiNode, field, childInfo);
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

  override expandValueConstraintsNode(vcNode: JsonNode, field: TemporalField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNode(vcNode, field, childInfo);
    vcNode[CedarModel.temporalType] = this.atomicWriter.write(field.valueConstraints.temporalType);
  }
}
