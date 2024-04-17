import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { StaticPageBreakField } from './StaticPageBreakField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { StaticPageBreakFieldImpl } from './StaticPageBreakFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';

export class YamlFieldReaderPageBreak extends YamlTemplateFieldTypeSpecificReader {
  override read(
    _fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): StaticPageBreakField {
    return StaticPageBreakFieldImpl.buildEmpty();
  }
}
