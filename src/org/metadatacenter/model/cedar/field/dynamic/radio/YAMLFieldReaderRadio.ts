import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { RadioField } from './RadioField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { RadioOption } from './RadioOption';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldReaderRadio extends YAMLFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): RadioField {
    const field = RadioField.buildEmptyWithNullValues();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const literals: Array<JsonNode> = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.values);
    if (literals !== null) {
      literals.forEach((literal) => {
        const label = ReaderUtil.getString(literal, YamlKeys.label);
        const selectedByDefault = ReaderUtil.getBoolean(literal, YamlKeys.selected);
        if (label != null) {
          const option = new RadioOption(label, selectedByDefault);
          field.valueConstraints.literals.push(option);
        }
      });
    }
    return field;
  }
}
