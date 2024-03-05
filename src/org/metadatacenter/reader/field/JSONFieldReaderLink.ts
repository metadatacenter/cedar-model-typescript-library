import { Node } from '../../model/cedar/util/types/Node';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { ReaderUtil } from '../ReaderUtil';
import { CedarModel } from '../../model/cedar/CedarModel';
import { ValueConstraintsTextField } from '../../model/cedar/field/textfield/ValueConstraintsTextField';
import { CedarLinkField } from '../../model/cedar/field/link/CedarLinkField';

export class JSONFieldReaderLink {
  static read(fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath): CedarLinkField {
    const field = CedarLinkField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);

    field.skos_altLabel = ReaderUtil.getStringList(fieldSourceObject, CedarModel.skosAltLabel);

    const vcTF = new ValueConstraintsTextField();
    field.valueConstraints = vcTF;
    const valueConstraints: Node = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcTF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
    }
    return field;
  }
}
