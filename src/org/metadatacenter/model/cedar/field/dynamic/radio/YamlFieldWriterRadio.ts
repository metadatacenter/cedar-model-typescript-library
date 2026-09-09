import { JsonNode } from '../../../types/basic-types/JsonNode';
import { RadioField } from './RadioField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';
import { YamlKeys } from '../../../constants/YamlKeys';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';

export class YamlFieldWriterRadio extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: RadioField, _childInfo: ChildDeploymentInfo): void {
    DefaultValueSerialization.writeLiteral(vcNode, YamlKeys.default, field.valueConstraints.defaultValue);
    this.expandLiterals(field, vcNode);
  }
}
