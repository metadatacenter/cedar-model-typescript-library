import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { StaticImageField } from './StaticImageField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { StaticImageFieldImpl } from './StaticImageFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';

export class YamlFieldReaderImage extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): StaticImageField {
    const field = StaticImageFieldImpl.buildEmpty();
    field.content = ReaderUtil.getString(fieldSourceObject, YamlKeys.content);
    return field;
  }
}
