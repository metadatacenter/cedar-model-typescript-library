import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { PhoneNumberField } from './PhoneNumberField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLFieldTypeSpecificReader';

export class YAMLFieldReaderPhoneNumber extends YAMLFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): PhoneNumberField {
    const field = PhoneNumberField.buildEmptyWithNullValues();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);
    return field;
  }
}
