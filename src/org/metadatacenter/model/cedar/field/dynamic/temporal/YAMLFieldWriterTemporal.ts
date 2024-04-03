import { JsonNode, JsonNodeClass } from '../../../types/basic-types/JsonNode';
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

  override expandUINodeForYAML(field: TemporalField): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    if (field.timezoneEnabled) {
      ret[YamlKeys.timeZone] = field.timezoneEnabled;
    }
    if (field.inputTimeFormat !== TimeFormat.NULL) {
      ret[YamlKeys.timeFormat] = this.atomicWriter.write(field.inputTimeFormat);
    }
    if (field.temporalGranularity !== TemporalGranularity.NULL) {
      ret[YamlKeys.granularity] = this.atomicWriter.write(field.temporalGranularity);
    }
    return ret;
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: TemporalField, _childInfo: ChildDeploymentInfo): void {
    vcNode[YamlKeys.datatype] = this.atomicWriter.write(field.valueConstraints.temporalType);
  }
}
