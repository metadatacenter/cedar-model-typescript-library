import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { NumericField } from './NumericField';
import { NumberType } from '../../../types/wrapped-types/NumberType';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { NumericFieldImpl } from './NumericFieldImpl';

export class JsonFieldReaderNumeric extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): NumericField {
    const field = NumericFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      field.valueConstraints.numberType = NumberType.forValue(ReaderUtil.getString(valueConstraints, CedarModel.numberType));
      field.valueConstraints.minValue = ReaderUtil.getNumber(valueConstraints, CedarModel.minValue);
      field.valueConstraints.maxValue = ReaderUtil.getNumber(valueConstraints, CedarModel.maxValue);
      field.valueConstraints.decimalPlaces = ReaderUtil.getNumber(valueConstraints, CedarModel.decimalPlace);
      field.valueConstraints.unitOfMeasure = ReaderUtil.getString(valueConstraints, CedarModel.unitOfMeasure);
    }
    return field;
  }
}
