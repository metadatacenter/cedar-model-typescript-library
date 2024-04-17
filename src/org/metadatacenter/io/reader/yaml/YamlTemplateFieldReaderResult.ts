import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';

export class YamlTemplateFieldReaderResult {
  private readonly _field: TemplateField;
  private readonly _parsingResult: YamlArtifactParsingResult;
  private readonly _fieldSourceObject: JsonNode;

  constructor(field: TemplateField, parsingResult: YamlArtifactParsingResult, fieldSourceObject: JsonNode) {
    this._field = field;
    this._parsingResult = parsingResult;
    this._fieldSourceObject = fieldSourceObject;
  }

  get field(): TemplateField {
    return this._field;
  }

  get parsingResult(): YamlArtifactParsingResult {
    return this._parsingResult;
  }

  get fieldSourceObject(): JsonNode {
    return this._fieldSourceObject;
  }
}
