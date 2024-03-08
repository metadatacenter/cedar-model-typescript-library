import { JsonNode } from '../../../util/types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { ValueConstraintsEmailField } from './ValueConstraintsEmailField';
import { CedarEmailField } from './CedarEmailField';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';

export class JSONFieldReaderEmail extends JSONFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: CedarJsonPath): CedarEmailField {
    const field = CedarEmailField.buildEmptyWithNullValues();

    const vcEF = new ValueConstraintsEmailField();
    field.valueConstraints = vcEF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcEF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
    }
    return field;
  }
}
