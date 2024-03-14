import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';
import { CedarCheckboxField } from './CedarCheckboxField';
import { ValueConstraintsCheckboxField } from './ValueConstraintsCheckboxField';
import { CedarCheckboxOption } from './CedarCheckboxOption';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

export class JSONFieldReaderCheckbox extends JSONFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: CedarContainerChildInfo,
    _parsingResult: ParsingResult,
    _path: CedarJsonPath,
  ): CedarCheckboxField {
    const field = CedarCheckboxField.buildEmptyWithNullValues();

    const vcCBF = new ValueConstraintsCheckboxField();
    field.valueConstraints = vcCBF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      childInfo.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
      const literals: Array<JsonNode> = ReaderUtil.getNodeList(valueConstraints, CedarModel.literals);
      if (literals !== null) {
        literals.forEach((literal) => {
          const label = ReaderUtil.getString(literal, CedarModel.label);
          const selectedByDefault = ReaderUtil.getBoolean(literal, CedarModel.selectedByDefault);
          if (label != null) {
            const option = new CedarCheckboxOption(label, selectedByDefault);
            vcCBF.literals.push(option);
          }
        });
      }
    }
    return field;
  }
}
