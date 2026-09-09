import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';
import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlKeys } from '../../../constants/YamlKeys';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';
import { ExtRridField } from './ExtRridField';

export class YamlFieldWriterExtRrid extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: ExtRridField, _childInfo: ChildDeploymentInfo): void {
    DefaultValueSerialization.writeIri(vcNode, YamlKeys.default, field.valueConstraints.defaultValue);
  }
}
