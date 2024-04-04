import { Template } from '../../../model/cedar/template/Template';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactReaderResult } from './JsonArtifactReaderResult';

export class JsonTemplateReaderResult extends JsonArtifactReaderResult {
  constructor(template: Template, parsingResult: ParsingResult, elementSourceObject: JsonNode) {
    super(template, parsingResult, elementSourceObject);
  }

  get template(): Template {
    return this._artifact as Template;
  }

  get templateSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}
