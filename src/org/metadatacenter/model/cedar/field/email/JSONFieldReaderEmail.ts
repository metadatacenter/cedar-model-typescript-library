import { Node } from '../../util/types/Node';
import { ParsingResult } from '../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../reader/ReaderUtil';
import { CedarModel } from '../../CedarModel';
import { ValueConstraintsEmailField } from './ValueConstraintsEmailField';
import { CedarEmailField } from './CedarEmailField';

export class JSONFieldReaderEmail {
  static read(fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath): CedarEmailField {
    const field = CedarEmailField.buildEmptyWithNullValues();

    const vcTF = new ValueConstraintsEmailField();
    field.valueConstraints = vcTF;
    const valueConstraints: Node = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcTF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
    }
    return field;
  }
}
