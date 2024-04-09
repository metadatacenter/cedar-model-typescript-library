import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { UnknownTemplateField } from '../../../model/cedar/field/UnknownTemplateField';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { ListField } from '../../../model/cedar/field/dynamic/list/ListField';
import { ReaderUtil } from '../ReaderUtil';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { ListOption } from '../../../model/cedar/field/dynamic/list/ListOption';

export abstract class YamlTemplateFieldTypeSpecificReader {
  public read(
    _fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): TemplateField {
    return UnknownTemplateField.build();
  }

  protected static readAndStoreListOptions(fieldSourceObject: JsonNode, field: ListField) {
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
  }
}
