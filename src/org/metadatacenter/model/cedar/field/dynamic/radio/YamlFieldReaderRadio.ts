import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { RadioField } from './RadioField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { RadioOption } from './RadioOption';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';
import { RadioFieldImpl } from './RadioFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';

export class YamlFieldReaderRadio extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): RadioField {
    const field = RadioFieldImpl.buildEmpty();

    field.valueConstraints.defaultValue = DefaultValueSerialization.literalFromNode(fieldSourceObject, YamlKeys.default);

    const literals: Array<JsonNode> = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.values);
    if (literals !== null) {
      literals.forEach((literal) => {
        // An option is its label and whether it is selected by default, as in Java's reader, which
        // reads nothing more of an entry and nothing of one without a label.
        const label = ReaderUtil.getString(literal, YamlKeys.label);
        if (label != null) {
          const selectedByDefault = ReaderUtil.getBoolean(literal, YamlKeys.selected);
          const statesSelectedByDefault = Object.hasOwn(literal, YamlKeys.selected);
          const option = new RadioOption(label, selectedByDefault, statesSelectedByDefault);
          field.valueConstraints.literals.push(option);
        }
      });
    }
    return field;
  }
}
