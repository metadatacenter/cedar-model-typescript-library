import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';
import { CedarListField } from './CedarListField';
import { ValueConstraintsListField } from './ValueConstraintsListField';
import { CedarListOption } from './CedarListOption';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

export class JSONFieldReaderList extends JSONFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: CedarContainerChildInfo,
    _parsingResult: ParsingResult,
    _path: CedarJsonPath,
  ): CedarListField {
    const field = CedarListField.buildEmptyWithNullValues();

    const vcLF = new ValueConstraintsListField();
    field.valueConstraints = vcLF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      field.multipleChoice = ReaderUtil.getBoolean(valueConstraints, CedarModel.multipleChoice);
      childInfo.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
      const literals: Array<JsonNode> = ReaderUtil.getNodeList(valueConstraints, CedarModel.literals);
      if (literals !== null) {
        literals.forEach((literal) => {
          const label = ReaderUtil.getString(literal, CedarModel.label);
          const selectedByDefault = ReaderUtil.getBoolean(literal, CedarModel.selectedByDefault);
          if (label != null) {
            const option = new CedarListOption(label, selectedByDefault);
            vcLF.literals.push(option);
          }
        });
      }
    }
    return field;
  }
}
