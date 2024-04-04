import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { NumericField } from './NumericField';
import { NumberType } from '../../../types/wrapped-types/NumberType';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';

export class JsonFieldReaderNumeric extends JsonTemplateFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): NumericField {
    const field = NumericField.buildEmptyWithNullValues();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      field.valueConstraints.numberType = NumberType.forValue(ReaderUtil.getString(valueConstraints, CedarModel.numberType));
      field.valueConstraints.minValue = ReaderUtil.getNumber(valueConstraints, CedarModel.minValue);
      field.valueConstraints.maxValue = ReaderUtil.getNumber(valueConstraints, CedarModel.maxValue);
      field.valueConstraints.decimalPlace = ReaderUtil.getNumber(valueConstraints, CedarModel.decimalPlace);
      field.valueConstraints.unitOfMeasure = ReaderUtil.getString(valueConstraints, CedarModel.unitOfMeasure);
    }
    return field;
  }
}
