import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { CedarRadioField } from './CedarRadioField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { ValueConstraintsRadioField } from './ValueConstraintsRadioField';
import { CedarRadioOption } from './CedarRadioOption';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';

export class JSONFieldReaderRadio extends JSONFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, _parsingResult: ParsingResult, _path: CedarJsonPath): CedarRadioField {
    const field = CedarRadioField.buildEmptyWithNullValues();

    const vcRF = new ValueConstraintsRadioField();
    field.valueConstraints = vcRF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcRF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
      const literals: Array<JsonNode> = ReaderUtil.getNodeList(valueConstraints, CedarModel.literals);
      if (literals !== null) {
        literals.forEach((literal) => {
          const label = ReaderUtil.getString(literal, CedarModel.label);
          const selectedByDefault = ReaderUtil.getBoolean(literal, CedarModel.selectedByDefault);
          if (label != null) {
            const option = new CedarRadioOption(label, selectedByDefault);
            vcRF.literals.push(option);
          }
        });
      }
    }
    return field;
  }
}
