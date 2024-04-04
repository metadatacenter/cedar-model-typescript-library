import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JSONTemplateFieldTypeSpecificReader';
import { ListField } from './ListField';
import { ListOption } from './ListOption';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';

export class JSONFieldReaderList extends JSONTemplateFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): ListField {
    const field = ListField.buildEmptyWithNullValues();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      field.multipleChoice = ReaderUtil.getBoolean(valueConstraints, CedarModel.multipleChoice);
      const literals: Array<JsonNode> = ReaderUtil.getNodeList(valueConstraints, CedarModel.literals);
      if (literals !== null) {
        literals.forEach((literal) => {
          const label = ReaderUtil.getString(literal, CedarModel.label);
          const selectedByDefault = ReaderUtil.getBoolean(literal, CedarModel.selectedByDefault);
          if (label != null) {
            const option = new ListOption(label, selectedByDefault);
            field.valueConstraints.literals.push(option);
          }
        });
      }
    }
    return field;
  }
}
