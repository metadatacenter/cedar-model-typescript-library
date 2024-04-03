import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { ListField } from './ListField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { TextField } from '../textfield/TextField';
import { XsdDatatype } from '../../../constants/XsdDatatype';
import { YamlArtifactType } from '../../../types/wrapped-types/YamlArtifactType';

export class YAMLFieldWriterList extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
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
