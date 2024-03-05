import { Node } from '../../model/cedar/util/types/Node';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { CedarTextField } from '../../model/cedar/field/textfield/CedarTextField';
import { ReaderUtil } from '../ReaderUtil';
import { CedarModel } from '../../model/cedar/CedarModel';
import { ValueConstraintsTextField } from '../../model/cedar/field/textfield/ValueConstraintsTextField';

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