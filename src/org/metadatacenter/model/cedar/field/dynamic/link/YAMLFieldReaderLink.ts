import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { LinkField } from './LinkField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLTemplateFieldTypeSpecificReader';

export class YAMLFieldReaderLink extends YAMLTemplateFieldTypeSpecificReader {
  override read(_fieldSourceObject: JsonNode, _childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): LinkField {
    const field = LinkField.buildEmptyWithNullValues();
    return field;
  }
}
