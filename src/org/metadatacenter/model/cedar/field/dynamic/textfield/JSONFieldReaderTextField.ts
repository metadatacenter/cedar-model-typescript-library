import { Node } from '../../../util/types/Node';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { CedarTextField } from './CedarTextField';
import { ReaderUtil } from '../../../../../reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { ValueConstraintsTextField } from './ValueConstraintsTextField';

export class JSONFieldReaderTextField {
  static read(fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath): CedarTextField {
    const field = CedarTextField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.valueRecommendationEnabled = ReaderUtil.getBoolean(uiNode, CedarModel.valueRecommendationEnabled);

    field.skos_altLabel = ReaderUtil.getStringList(fieldSourceObject, CedarModel.skosAltLabel);

    const vcTF = new ValueConstraintsTextField();
    field.valueConstraints = vcTF;
    const valueConstraints: Node = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcTF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
      vcTF.defaultValue = ReaderUtil.getString(valueConstraints, CedarModel.defaultValue);
      vcTF.minLength = ReaderUtil.getNumber(valueConstraints, CedarModel.minLength);
      vcTF.maxLength = ReaderUtil.getNumber(valueConstraints, CedarModel.maxLength);
      vcTF.regex = ReaderUtil.getString(valueConstraints, CedarModel.regex);
    }
    return field;
  }
}
