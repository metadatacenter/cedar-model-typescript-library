import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalField } from './TemporalField';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldWriterTemporal extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(uiNode: JsonNode, field: TemporalField, childInfo: ChildDeploymentInfo): void {
    super.expandUINodeForYAML(uiNode, field, childInfo);
    if (field.timezoneEnabled) {
      uiNode[YamlKeys.timeZone] = field.timezoneEnabled;
    }
    if (field.inputTimeFormat !== TimeFormat.NULL) {
      uiNode[CedarModel.inputTimeFormat] = this.atomicWriter.write(field.inputTimeFormat);
    }
    if (field.temporalGranularity !== TemporalGranularity.NULL) {
      uiNode[YamlKeys.granularity] = this.atomicWriter.write(field.temporalGranularity);
    }
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: TemporalField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNodeForYAML(vcNode, field, childInfo);
    vcNode[YamlKeys.datatype] = this.atomicWriter.write(field.valueConstraints.temporalType);
  }
}
