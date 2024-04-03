import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ListField } from './ListField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLFieldReaderSingleSelectList } from './YAMLFieldReaderSingleSelectList';

export class YAMLFieldReaderMultiSelectList extends YAMLFieldReaderSingleSelectList {
  override read(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): ListField {
    const field = super.read(fieldSourceObject, childInfo, _parsingResult, _path);
    field.multipleChoice = true;
    return field;
  }
}
