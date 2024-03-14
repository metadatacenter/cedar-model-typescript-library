import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { CedarTextArea } from './CedarTextArea';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { ValueConstraints } from '../../ValueConstraints';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

export class JSONFieldReaderTextArea extends JSONFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: CedarContainerChildInfo,
    _parsingResult: ParsingResult,
    _path: CedarJsonPath,
  ): CedarTextArea {
    const field = CedarTextArea.buildEmptyWithNullValues();

    const vcTF = new ValueConstraints();
    field.valueConstraints = vcTF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      childInfo.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
    }
    return field;
  }
}
