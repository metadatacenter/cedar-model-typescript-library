import { JsonNode, JsonNodeClass } from '../../../util/types/JsonNode';
import { CedarModel } from '../../../CedarModel';
import { JSONFieldWriter } from '../../JSONFieldWriter';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarRadioField } from './CedarRadioField';

export class JSONFieldWriterRadio extends JSONFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarRadioField): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field);
    vcNode[CedarModel.multipleChoice] = field.valueConstraints.multipleChoice;
    const literals: Array<JsonNode> = [];
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
