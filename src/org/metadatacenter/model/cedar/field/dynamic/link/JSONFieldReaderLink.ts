import { JsonNode } from '../../../util/types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { ValueConstraintsTextField } from '../textfield/ValueConstraintsTextField';
import { CedarLinkField } from './CedarLinkField';

export class JSONFieldReaderLink {
  static read(fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: CedarJsonPath): CedarLinkField {
    const field = CedarLinkField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);

    field.skos_altLabel = ReaderUtil.getStringList(fieldSourceObject, CedarModel.skosAltLabel);

    const vcTF = new ValueConstraintsTextField();
    field.valueConstraints = vcTF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcTF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
    }
    return field;
  }
}
