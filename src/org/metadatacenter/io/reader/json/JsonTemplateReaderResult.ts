import { Template } from '../../../model/cedar/template/Template';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactReaderResult } from './JsonArtifactReaderResult';

export class JsonTemplateReaderResult extends JsonArtifactReaderResult {
  constructor(template: Template, parsingResult: JsonArtifactParsingResult, elementSourceObject: JsonNode) {
    super(template, parsingResult, elementSourceObject);
  }

  get template(): Template {
    return this._artifact as Template;
  }

  get templateSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}
