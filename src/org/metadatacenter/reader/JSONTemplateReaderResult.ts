import { CedarTemplate } from '../model/cedar/template/CedarTemplate';
import { ParsingResult } from '../model/cedar/util/compare/ParsingResult';

export class JSONTemplateReaderResult {
  private readonly _template: CedarTemplate;
  private readonly _parsingResult: ParsingResult;

  constructor(template: CedarTemplate, parsingResult: ParsingResult) {
    this._template = template;
    this._parsingResult = parsingResult;
  }

  get template(): CedarTemplate {
    return this._template;
  }

  get parsingResult(): ParsingResult {
    return this._parsingResult;
  }
}
