import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { PhoneNumberField } from './PhoneNumberField';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { PhoneNumberFieldImpl } from './PhoneNumberFieldImpl';

export class JsonFieldReaderPhoneNumber extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): PhoneNumberField {
    const field = PhoneNumberFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);
    return field;
  }
}
