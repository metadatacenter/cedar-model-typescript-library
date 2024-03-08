import { CedarTemplate } from '../../model/cedar/template/CedarTemplate';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';

export class JSONTemplateReaderResult {
  private readonly _template: CedarTemplate;
  private readonly _parsingResult: ParsingResult;
  private readonly _templateSourceObject: JsonNode;

  constructor(template: CedarTemplate, parsingResult: ParsingResult, templateSourceObject: JsonNode) {
    this._template = template;
    this._parsingResult = parsingResult;
    this._templateSourceObject = templateSourceObject;
  }

  get template(): CedarTemplate {
    return this._template;
  }

  get parsingResult(): ParsingResult {
    return this._parsingResult;
  }

  get templateSourceObject(): JsonNode {
    return this._templateSourceObject;
  }
}
