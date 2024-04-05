import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { ListField } from './ListField';
import { ListOption } from './ListOption';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';
import { ListFieldImpl } from './ListFieldImpl';

export class YamlFieldReaderSingleSelectList extends YamlTemplateFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, _childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): ListField {
    const field = ListFieldImpl.buildEmpty();

    field.multipleChoice = false;
    const literals: Array<JsonNode> = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.values);
    if (literals !== null) {
      literals.forEach((literal) => {
        const label = ReaderUtil.getString(literal, YamlKeys.label);
        const selectedByDefault = ReaderUtil.getBoolean(literal, YamlKeys.selected);
        if (label != null) {
          const option = new ListOption(label, selectedByDefault);
          field.valueConstraints.literals.push(option);
        }
      });
    }
    return field;
  }
}
