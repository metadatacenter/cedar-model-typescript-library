import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { AttributeValueField } from './AttributeValueField';
import { JSONTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JSONTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';

export class JSONFieldReaderAttributeValue extends JSONTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): AttributeValueField {
    const field = AttributeValueField.buildEmptyWithNullValues();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);
    return field;
  }
}
