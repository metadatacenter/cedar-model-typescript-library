import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarField } from '../../model/cedar/field/CedarField';

export class JSONFieldReaderResult {
  private readonly _field: CedarField;
  private readonly _parsingResult: ParsingResult;
  private readonly _fieldSourceObject: JsonNode;

  constructor(field: CedarField, parsingResult: ParsingResult, fieldSourceObject: JsonNode) {
    this._field = field;
    this._parsingResult = parsingResult;
    this._fieldSourceObject = fieldSourceObject;
  }

  get field(): CedarField {
    return this._field;
  }

  get parsingResult(): ParsingResult {
    return this._parsingResult;
  }

  get fieldSourceObject(): JsonNode {
    return this._fieldSourceObject;
  }
}
