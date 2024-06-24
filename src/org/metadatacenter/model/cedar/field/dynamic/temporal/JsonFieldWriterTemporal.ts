import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalField } from './TemporalField';
import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';
import { JsonSchema } from '../../../constants/JsonSchema';

export class JsonFieldWriterTemporal extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  override expandUINode(uiNode: JsonNode, field: TemporalField, childInfo: ChildDeploymentInfo): void {
    super.expandUINode(uiNode, field, childInfo);
    if (field.temporalGranularity !== TemporalGranularity.NULL) {
      uiNode[CedarModel.temporalGranularity] = this.atomicWriter.write(field.temporalGranularity);
    }
    if (TemporalGranularity.hasTime(field.temporalGranularity)) {
      if (field.inputTimeFormat !== TimeFormat.NULL) {
        uiNode[CedarModel.inputTimeFormat] = this.atomicWriter.write(field.inputTimeFormat);
      }
      uiNode[CedarModel.timezoneEnabled] = field.timezoneEnabled;
    }
  }

  override expandValueConstraintsNode(vcNode: JsonNode, field: TemporalField, childInfo: ChildDeploymentInfo): void {
    vcNode[CedarModel.temporalType] = this.atomicWriter.write(field.valueConstraints.temporalType);
    super.expandValueConstraintsNode(vcNode, field, childInfo);
  }

  override expandRequiredNode(requiredObject: JsonNode): void {
    requiredObject[JsonSchema.required] = [JsonSchema.atValue, JsonSchema.atType];
  }
}
