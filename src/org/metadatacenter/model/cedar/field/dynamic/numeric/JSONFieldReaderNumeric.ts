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

    const vcTF = new ValueConstraintsNumericField();
    field.valueConstraints = vcTF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcTF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
      vcTF.numberType = NumberType.forValue(ReaderUtil.getString(valueConstraints, CedarModel.numberType));
    }
    return field;
  }
}
