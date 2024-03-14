import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { CedarNumericField } from './CedarNumericField';
import { NumberType } from '../../../types/beans/NumberType';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

export class JSONFieldReaderNumeric extends JSONFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: CedarContainerChildInfo,
    _parsingResult: ParsingResult,
    _path: CedarJsonPath,
  ): CedarNumericField {
    const field = CedarNumericField.buildEmptyWithNullValues();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    field.skos_altLabel = ReaderUtil.getStringList(fieldSourceObject, CedarModel.skosAltLabel);

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
