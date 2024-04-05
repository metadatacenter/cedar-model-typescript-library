import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { PhoneNumberField } from './PhoneNumberField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { PhoneNumberFieldImpl } from './PhoneNumberFieldImpl';

export class YamlFieldReaderPhoneNumber extends YamlTemplateFieldTypeSpecificReader {
  override read(
    _fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): PhoneNumberField {
    const field = PhoneNumberFieldImpl.buildEmpty();
    return field;
  }
}
