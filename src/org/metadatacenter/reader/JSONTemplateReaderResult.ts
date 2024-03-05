import { CedarTemplate } from '../model/cedar/template/CedarTemplate';
import { ParsingResult } from '../model/cedar/util/compare/ParsingResult';
import { Node } from '../model/cedar/util/types/Node';

export class JSONTemplateReaderResult {
  private readonly _template: CedarTemplate;
  private readonly _parsingResult: ParsingResult;
  private readonly _templateSourceObject: Node;

  constructor(template: CedarTemplate, parsingResult: ParsingResult, templateSourceObject: Node) {
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

  get templateSourceObject(): Node {
    return this._templateSourceObject;
  }
}
