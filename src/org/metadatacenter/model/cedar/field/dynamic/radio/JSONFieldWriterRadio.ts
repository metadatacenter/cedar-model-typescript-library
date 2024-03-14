import { JsonNode, JsonNodeClass } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONFieldWriterInternal } from '../../../../../io/writer/JSONFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarRadioField } from './CedarRadioField';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

export class JSONFieldWriterRadio extends JSONFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarRadioField, childInfo: CedarContainerChildInfo): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    vcNode[CedarModel.multipleChoice] = false;
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
