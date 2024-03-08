import { JsonNode } from '../../../util/types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { ValueConstraintsNumericField } from './ValueConstraintsNumericField';
import { CedarNumericField } from './CedarNumericField';
import { NumberType } from '../../../beans/NumberType';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';

export class JSONFieldReaderNumeric extends JSONFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, _parsingResult: ParsingResult, _path: CedarJsonPath): CedarNumericField {
    const field = CedarNumericField.buildEmptyWithNullValues();

    field.skos_altLabel = ReaderUtil.getStringList(fieldSourceObject, CedarModel.skosAltLabel);

    const vcNF = new ValueConstraintsNumericField();
    field.valueConstraints = vcNF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcNF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
      vcNF.numberType = NumberType.forValue(ReaderUtil.getString(valueConstraints, CedarModel.numberType));
      vcNF.minValue = ReaderUtil.getNumber(valueConstraints, CedarModel.minValue);
      vcNF.maxValue = ReaderUtil.getNumber(valueConstraints, CedarModel.maxValue);
      vcNF.decimalPlace = ReaderUtil.getNumber(valueConstraints, CedarModel.decimalPlace);
      vcNF.unitOfMeasure = ReaderUtil.getString(valueConstraints, CedarModel.unitOfMeasure);
    }
    return field;
  }
}
