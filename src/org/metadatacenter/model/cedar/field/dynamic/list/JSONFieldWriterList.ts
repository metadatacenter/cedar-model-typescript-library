import { JsonNode, JsonNodeClass } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONTemplateFieldWriterInternal } from '../../../../../io/writer/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { ListField } from './ListField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';

export class JSONFieldWriterList extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: ListField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    vcNode[CedarModel.multipleChoice] = field.multipleChoice;
    const literals: Array<JsonNode> = JsonNodeClass.getEmptyList();
    field.valueConstraints.literals.forEach((option) => {
      const literal = JsonNodeClass.getEmpty();
      literal[CedarModel.label] = option.label;
      if (option.selectedByDefault) {
        literal[CedarModel.selectedByDefault] = option.selectedByDefault;
      }
      literals.push(literal);
    });
    vcNode[CedarModel.literals] = literals;
  }
}
