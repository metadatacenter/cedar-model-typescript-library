import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';
import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlKeys } from '../../../constants/YamlKeys';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';
import { ExtPfasField } from './ExtPfasField';

export class YamlFieldWriterExtPfas extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: ExtPfasField, _childInfo: ChildDeploymentInfo): void {
    DefaultValueSerialization.writeIri(vcNode, YamlKeys.default, field.valueConstraints.defaultValue);
  }
}
