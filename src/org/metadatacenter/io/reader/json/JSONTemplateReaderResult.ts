import { Template } from '../../../model/cedar/template/Template';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JSONArtifactReaderResult } from './JSONArtifactReaderResult';

export class JSONTemplateReaderResult extends JSONArtifactReaderResult {
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
