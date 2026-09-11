import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { RadioField } from './RadioField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { RadioOption } from './RadioOption';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { RadioFieldImpl } from './RadioFieldImpl';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';

export class JsonFieldReaderRadio extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): RadioField {
    const field = RadioFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      field.valueConstraints.defaultValue = DefaultValueSerialization.literalFromNode(valueConstraints, CedarModel.defaultValue);
      const literals: Array<JsonNode> = ReaderUtil.getNodeList(valueConstraints, CedarModel.literals);
      if (literals !== null) {
        literals.forEach((literal) => {
          const label = ReaderUtil.getString(literal, CedarModel.label);
          const selectedByDefault = ReaderUtil.getBoolean(literal, CedarModel.selectedByDefault);
          if (label != null) {
            const option = new RadioOption(label, selectedByDefault);
            field.valueConstraints.literals.push(option);
          }
        });
      }
    }
    return field;
  }
}
