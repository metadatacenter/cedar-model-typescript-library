import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ListField } from './ListField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlArtifactType } from '../../../types/wrapped-types/YamlArtifactType';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YamlFieldWriterList extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: ListField, _childInfo: ChildDeploymentInfo): void {
    if (field.valueConstraints.defaultValue !== null && field.valueConstraints.defaultValue !== '') {
      vcNode[YamlKeys.default] = field.valueConstraints.defaultValue;
    }
    this.expandLiterals(field, vcNode);
  }

  protected override getYamlType(field: ListField) {
    if (field.multipleChoice) {
      return YamlArtifactType.MULTI_SELECT_LIST.getValue();
    } else {
      return YamlArtifactType.SINGLE_SELECT_LIST.getValue();
    }
  }
}
