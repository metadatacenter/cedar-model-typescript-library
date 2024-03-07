import { JsonNode } from '../../../util/types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { CedarStaticYoutubeField } from './CedarStaticYoutubeField';

export class JSONFieldReaderYoutube {
  static read(fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: CedarJsonPath): CedarStaticYoutubeField {
    const field = CedarStaticYoutubeField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.videoId = ReaderUtil.getString(uiNode, CedarModel.content);
    const sizeNode = ReaderUtil.getNode(uiNode, CedarModel.size);
    field.width = ReaderUtil.getNumber(sizeNode, CedarModel.width);
    field.height = ReaderUtil.getNumber(sizeNode, CedarModel.height);
    return field;
  }
}
