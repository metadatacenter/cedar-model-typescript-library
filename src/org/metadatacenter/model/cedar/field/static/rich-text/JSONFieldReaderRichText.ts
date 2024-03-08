import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { CedarStaticRichTextField } from './CedarStaticRichTextField';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';

export class JSONFieldReaderRichText extends JSONFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, _parsingResult: ParsingResult, _path: CedarJsonPath): CedarStaticRichTextField {
    const field = CedarStaticRichTextField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.content = ReaderUtil.getString(uiNode, CedarModel.content);
    return field;
  }
}
