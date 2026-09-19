import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { StaticPageBreakField } from './StaticPageBreakField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { StaticPageBreakFieldImpl } from './StaticPageBreakFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { YamlKeys } from '../../../constants/YamlKeys';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';

export class YamlFieldReaderPageBreak extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): StaticPageBreakField {
    const field = StaticPageBreakFieldImpl.buildEmpty();
    field.content = ReaderUtil.getString(fieldSourceObject, YamlKeys.content);
    return field;
  }
}
