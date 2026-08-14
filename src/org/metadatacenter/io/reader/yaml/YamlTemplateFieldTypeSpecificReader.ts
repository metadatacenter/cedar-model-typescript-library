import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';
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
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): TemplateField {
    return UnknownTemplateField.build();
  }

  /**
   * A list field's value constraints are its options and, when one is set, the value the field takes
   * by default. The writer emits the default as `default` beside the options; leaving it unread made
   * writing what had just been read drop it.
   */
  protected static readAndStoreListValueConstraints(fieldSourceObject: JsonNode, field: ListField) {
    field.valueConstraints.defaultValue = ReaderUtil.getString(fieldSourceObject, YamlKeys.default);
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
