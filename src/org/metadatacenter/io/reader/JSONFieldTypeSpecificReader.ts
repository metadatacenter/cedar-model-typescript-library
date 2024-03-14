import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { CedarField } from '../../model/cedar/field/CedarField';
import { CedarUnknownField } from '../../model/cedar/field/CedarUnknownField';
import { CedarContainerChildInfo } from '../../model/cedar/types/beans/CedarContainerChildInfo';
import { ReaderUtil } from './ReaderUtil';
import { CedarModel } from '../../model/cedar/constants/CedarModel';

export abstract class JSONFieldTypeSpecificReader {
  public read(
    _fieldSourceObject: JsonNode,
    _childInfo: CedarContainerChildInfo,
    _parsingResult: ParsingResult,
    _path: CedarJsonPath,
  ): CedarField {
    return CedarUnknownField.build();
  }

  protected readRequiredAndHidden(fieldSourceObject: JsonNode, childInfo: CedarContainerChildInfo): void {
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
