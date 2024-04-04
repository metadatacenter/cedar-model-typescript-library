import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CheckboxField } from './CheckboxField';
import { CheckboxOption } from './CheckboxOption';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldReaderCheckbox extends YAMLTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): CheckboxField {
    const field = CheckboxField.buildEmptyWithNullValues();
    const literals: Array<JsonNode> = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.values);
    if (literals !== null) {
      literals.forEach((literal) => {
        const label = ReaderUtil.getString(literal, YamlKeys.label);
        const selectedByDefault = ReaderUtil.getBoolean(literal, YamlKeys.selected);
        if (label != null) {
          const option = new CheckboxOption(label, selectedByDefault);
          field.valueConstraints.literals.push(option);
        }
      });
    }
    return field;
  }
}
