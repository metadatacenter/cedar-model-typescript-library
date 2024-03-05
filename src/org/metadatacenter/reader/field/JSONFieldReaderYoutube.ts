import { Node } from '../../model/cedar/util/types/Node';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { ReaderUtil } from '../ReaderUtil';
import { CedarModel } from '../../model/cedar/CedarModel';
import { CedarStaticYoutubeField } from '../../model/cedar/field/static-youtube/CedarStaticYoutubeField';

export class JSONFieldReaderYoutube {
  static read(fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath): CedarStaticYoutubeField {
    const field = CedarStaticYoutubeField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.videoId = ReaderUtil.getString(uiNode, CedarModel.content);
    const sizeNode = ReaderUtil.getNode(uiNode, CedarModel.size);
    field.width = ReaderUtil.getNumber(sizeNode, CedarModel.width);
    field.height = ReaderUtil.getNumber(sizeNode, CedarModel.height);
    return field;
  }
}
