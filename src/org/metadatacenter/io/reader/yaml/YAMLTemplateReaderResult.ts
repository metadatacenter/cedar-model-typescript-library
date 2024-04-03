import { Template } from '../../../model/cedar/template/Template';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';

export class YAMLTemplateReaderResult {
  private readonly _template: Template;
  private readonly _parsingResult: ParsingResult;
  private readonly _templateSourceObject: JsonNode;

  constructor(template: Template, parsingResult: ParsingResult, templateSourceObject: JsonNode) {
    this._template = template;
    this._parsingResult = parsingResult;
    this._templateSourceObject = templateSourceObject;
  }

  get template(): Template {
    return this._template;
  }

  get parsingResult(): ParsingResult {
    return this._parsingResult;
  }

  get templateSourceObject(): JsonNode {
    return this._templateSourceObject;
  }
}
