import { JsonNode } from '../../../util/types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { ValueConstraintsNumericField } from './ValueConstraintsNumericField';
import { CedarNumericField } from './CedarNumericField';
import { NumberType } from '../../../beans/NumberType';

export class JSONFieldReaderNumeric {
  static read(fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: CedarJsonPath): CedarNumericField {
    const field = CedarNumericField.buildEmptyWithNullValues();

    field.skos_altLabel = ReaderUtil.getStringList(fieldSourceObject, CedarModel.skosAltLabel);

    const vcTF = new ValueConstraintsNumericField();
    field.valueConstraints = vcTF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcTF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
      vcTF.numberType = NumberType.forValue(ReaderUtil.getString(valueConstraints, CedarModel.numberType));
      vcTF.minValue = ReaderUtil.getNumber(valueConstraints, CedarModel.minValue);
      vcTF.maxValue = ReaderUtil.getNumber(valueConstraints, CedarModel.maxValue);
      vcTF.decimalPlace = ReaderUtil.getNumber(valueConstraints, CedarModel.decimalPlace);
      vcTF.unitOfMeasure = ReaderUtil.getString(valueConstraints, CedarModel.unitOfMeasure);
    }
    return field;
  }
}
