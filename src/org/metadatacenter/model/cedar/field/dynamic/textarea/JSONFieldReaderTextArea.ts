import { JsonNode } from '../../../util/types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { CedarTextArea } from './CedarTextArea';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { ValueConstraints } from '../../ValueConstraints';

export class JSONFieldReaderTextArea {
  static read(fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: CedarJsonPath): CedarTextArea {
    const field = CedarTextArea.buildEmptyWithNullValues();

    const vcTF = new ValueConstraints();
    field.valueConstraints = vcTF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcTF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
    }
    return field;
  }
}
