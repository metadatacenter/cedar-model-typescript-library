import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { UnknownTemplateField } from '../../../model/cedar/field/UnknownTemplateField';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { ReaderUtil } from '../ReaderUtil';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';

export abstract class JsonTemplateFieldTypeSpecificReader {
  public read(
    _fieldSourceObject: JsonNode,
    _childInfo: AbstractChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): TemplateField {
    return UnknownTemplateField.build();
  }

  protected readRequiredAndHidden(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo): void {
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      childInfo.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
      childInfo.recommendedValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.ValueConstraints.recommendedValue);
    }
    const uiNode: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    if (uiNode) {
      childInfo.hidden = ReaderUtil.getBoolean(uiNode, CedarModel.Ui.hidden);
    }
  }
}
