import { JsonNode } from '../../../util/types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { CedarStaticPageBreakField } from './CedarStaticPageBreakField';

export class JSONFieldReaderPageBreak {
  static read(fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: CedarJsonPath): CedarStaticPageBreakField {
    const field = CedarStaticPageBreakField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    return field;
  }
}