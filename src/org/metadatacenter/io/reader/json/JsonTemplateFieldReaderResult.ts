import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { JsonArtifactReaderResult } from './JsonArtifactReaderResult';

export class JsonTemplateFieldReaderResult extends JsonArtifactReaderResult {
  constructor(field: TemplateField, parsingResult: ParsingResult, elementSourceObject: JsonNode) {
    super(field, parsingResult, elementSourceObject);
  }

  get field(): TemplateField {
    return this._artifact as TemplateField;
  }

  get fieldSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}