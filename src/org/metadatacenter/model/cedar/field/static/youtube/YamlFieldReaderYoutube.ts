import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { StaticYoutubeField } from './StaticYoutubeField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';
import { StaticYoutubeFieldImpl } from './StaticYoutubeFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';

export class YamlFieldReaderYoutube extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): StaticYoutubeField {
    const field = StaticYoutubeFieldImpl.buildEmpty();
    field.videoId = ReaderUtil.getString(fieldSourceObject, YamlKeys.content);
    field.width = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.width);
    field.height = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.height);
    return field;
  }
}
