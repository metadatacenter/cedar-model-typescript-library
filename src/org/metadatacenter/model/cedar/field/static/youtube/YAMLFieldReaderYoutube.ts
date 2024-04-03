import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { StaticYoutubeField } from './StaticYoutubeField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldReaderYoutube extends YAMLFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): StaticYoutubeField {
    const field = StaticYoutubeField.buildEmptyWithNullValues();
    field.videoId = ReaderUtil.getString(fieldSourceObject, YamlKeys.content);
    field.width = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.width);
    field.height = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.height);
    return field;
  }
}
