import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { StaticYoutubeField } from './StaticYoutubeField';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';

export class JsonFieldReaderYoutube extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): StaticYoutubeField {
    const field = StaticYoutubeField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.videoId = ReaderUtil.getString(uiNode, CedarModel.content);
    const sizeNode = ReaderUtil.getNode(uiNode, CedarModel.size);
    field.width = ReaderUtil.getNumber(sizeNode, CedarModel.width);
    field.height = ReaderUtil.getNumber(sizeNode, CedarModel.height);
    return field;
  }
}
