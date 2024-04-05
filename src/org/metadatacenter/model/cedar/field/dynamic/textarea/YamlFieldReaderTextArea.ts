import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { TextArea } from './TextArea';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { TextAreaImpl } from './TextAreaImpl';

export class YamlFieldReaderTextArea extends YamlTemplateFieldTypeSpecificReader {
  override read(_fieldSourceObject: JsonNode, _childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): TextArea {
    const field = TextAreaImpl.buildEmpty();
    return field;
  }
}
