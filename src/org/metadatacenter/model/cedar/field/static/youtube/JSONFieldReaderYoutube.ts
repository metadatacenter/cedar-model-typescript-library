import { JsonNode } from '../../../util/types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { CedarStaticYoutubeField } from './CedarStaticYoutubeField';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';

export class JSONFieldReaderYoutube extends JSONFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, _parsingResult: ParsingResult, _path: CedarJsonPath): CedarStaticYoutubeField {
    const field = CedarStaticYoutubeField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.videoId = ReaderUtil.getString(uiNode, CedarModel.content);
    const sizeNode = ReaderUtil.getNode(uiNode, CedarModel.size);
    field.width = ReaderUtil.getNumber(sizeNode, CedarModel.width);
    field.height = ReaderUtil.getNumber(sizeNode, CedarModel.height);
    return field;
  }
}
