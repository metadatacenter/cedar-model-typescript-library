import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { LinkField } from './LinkField';
import { JSONTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JSONTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';

export class JSONFieldReaderLink extends JSONTemplateFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): LinkField {
    const field = LinkField.buildEmptyWithNullValues();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);
    return field;
  }
}
