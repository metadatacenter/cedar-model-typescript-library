import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ListField } from './ListField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { TextField } from '../textfield/TextField';
import { XsdDatatype } from '../../../constants/XsdDatatype';
import { YamlArtifactType } from '../../../types/wrapped-types/YamlArtifactType';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlFieldWriterList extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(_field: TextField): JsonNode {
    return { [YamlKeys.datatype]: XsdDatatype.STRING };
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: ListField, _childInfo: ChildDeploymentInfo): void {
    this.expandLiterals(field, vcNode);
  }

  protected override macroType(field: ListField) {
    if (field.multipleChoice) {
      return YamlArtifactType.MULTI_SELECT_LIST.getValue();
    } else {
      return YamlArtifactType.SINGLE_SELECT_LIST.getValue();
    }
  }
}
