import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { PhoneNumberField } from './PhoneNumberField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLTemplateFieldTypeSpecificReader';

export class YAMLFieldReaderPhoneNumber extends YAMLTemplateFieldTypeSpecificReader {
  override read(
    _fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): PhoneNumberField {
    const field = PhoneNumberField.buildEmptyWithNullValues();
    return field;
  }
}
