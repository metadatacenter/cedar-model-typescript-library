import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { TextArea } from './TextArea';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLFieldTypeSpecificReader';

export class YAMLFieldReaderTextArea extends YAMLFieldTypeSpecificReader {
  override read(_fieldSourceObject: JsonNode, _childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): TextArea {
    const field = TextArea.buildEmptyWithNullValues();
    return field;
  }
}
