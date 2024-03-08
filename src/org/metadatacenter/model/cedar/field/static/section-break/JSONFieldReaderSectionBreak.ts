import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { CedarStaticSectionBreakField } from './CedarStaticSectionBreakField';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';

export class JSONFieldReaderSectionBreak extends JSONFieldTypeSpecificReader {
  override read(_fieldSourceObject: JsonNode, _parsingResult: ParsingResult, _path: CedarJsonPath): CedarStaticSectionBreakField {
    const field = CedarStaticSectionBreakField.buildEmptyWithNullValues();
    return field;
  }
}
