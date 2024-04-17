import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { TextArea } from './TextArea';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { TextAreaImpl } from './TextAreaImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';

export class YamlFieldReaderTextArea extends YamlTemplateFieldTypeSpecificReader {
  override read(
    _fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): TextArea {
    const field = TextAreaImpl.buildEmpty();
    return field;
  }
}
