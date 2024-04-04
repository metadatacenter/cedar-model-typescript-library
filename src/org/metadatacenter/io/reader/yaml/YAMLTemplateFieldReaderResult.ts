import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateField } from '../../../model/cedar/field/TemplateField';

export class YAMLTemplateFieldReaderResult {
  private readonly _field: TemplateField;
  private readonly _parsingResult: ParsingResult;
  private readonly _fieldSourceObject: JsonNode;

  constructor(field: TemplateField, parsingResult: ParsingResult, fieldSourceObject: JsonNode) {
    this._field = field;
    this._parsingResult = parsingResult;
    this._fieldSourceObject = fieldSourceObject;
  }

  get field(): TemplateField {
    return this._field;
  }

  get parsingResult(): ParsingResult {
    return this._parsingResult;
  }

  get fieldSourceObject(): JsonNode {
    return this._fieldSourceObject;
  }
}
