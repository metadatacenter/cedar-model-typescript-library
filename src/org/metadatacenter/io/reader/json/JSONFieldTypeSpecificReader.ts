import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { UnknownTemplateField } from '../../../model/cedar/field/UnknownTemplateField';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { ReaderUtil } from '../ReaderUtil';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';

export abstract class JSONFieldTypeSpecificReader {
  public read(
    _fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): TemplateField {
    return UnknownTemplateField.build();
  }

  protected readRequiredAndHidden(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo): void {
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      childInfo.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
    }
    const uiNode: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    if (uiNode) {
      childInfo.hidden = ReaderUtil.getBoolean(uiNode, CedarModel.Ui.hidden);
    }
  }
}
