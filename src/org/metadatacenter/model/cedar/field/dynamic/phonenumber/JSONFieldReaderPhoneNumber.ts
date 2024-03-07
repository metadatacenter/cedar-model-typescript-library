import { JsonNode } from '../../../util/types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { CedarPhoneNumberField } from './CedarPhoneNumberField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { ValueConstraints } from '../../ValueConstraints';

export class JSONFieldReaderPhoneNumber {
  static read(fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: CedarJsonPath): CedarPhoneNumberField {
    const field = CedarPhoneNumberField.buildEmptyWithNullValues();

    const vc = new ValueConstraints();
    field.valueConstraints = vc;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vc.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
    }
    return field;
  }
}
