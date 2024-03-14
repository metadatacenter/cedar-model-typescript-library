import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { CedarStaticPageBreakField } from './CedarStaticPageBreakField';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

export class JSONFieldReaderPageBreak extends JSONFieldTypeSpecificReader {
  override read(
    _fieldSourceObject: JsonNode,
    _childInfo: CedarContainerChildInfo,
    _parsingResult: ParsingResult,
    _path: CedarJsonPath,
  ): CedarStaticPageBreakField {
    const field = CedarStaticPageBreakField.buildEmptyWithNullValues();
    return field;
  }
}
