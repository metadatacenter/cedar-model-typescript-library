import { Template } from '../../../model/cedar/template/Template';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';

export class YamlTemplateReaderResult {
  private readonly _template: Template;
  private readonly _parsingResult: YamlArtifactParsingResult;
  private readonly _templateSourceObject: JsonNode;

  constructor(template: Template, parsingResult: YamlArtifactParsingResult, templateSourceObject: JsonNode) {
    this._template = template;
    this._parsingResult = parsingResult;
    this._templateSourceObject = templateSourceObject;
  }

  get template(): Template {
    return this._template;
  }

  get parsingResult(): YamlArtifactParsingResult {
    return this._parsingResult;
  }

  get templateSourceObject(): JsonNode {
    return this._templateSourceObject;
  }
}
