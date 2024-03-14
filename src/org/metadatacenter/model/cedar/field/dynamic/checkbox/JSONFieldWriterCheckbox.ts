import { JsonNode, JsonNodeClass } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONFieldWriter } from '../../../../../io/writer/JSONFieldWriter';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarCheckboxField } from './CedarCheckboxField';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

export class JSONFieldWriterCheckbox extends JSONFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarCheckboxField, childInfo: CedarContainerChildInfo): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    vcNode[CedarModel.multipleChoice] = true;
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
