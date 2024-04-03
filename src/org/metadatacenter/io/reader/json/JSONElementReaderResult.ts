import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';

export class JSONElementReaderResult {
  private readonly _element: TemplateElement;
  private readonly _parsingResult: ParsingResult;
  private readonly _elementSourceObject: JsonNode;

  constructor(element: TemplateElement, parsingResult: ParsingResult, elementSourceObject: JsonNode) {
    this._element = element;
    this._parsingResult = parsingResult;
    this._elementSourceObject = elementSourceObject;
  }

  get element(): TemplateElement {
    return this._element;
  }

  get parsingResult(): ParsingResult {
    return this._parsingResult;
  }

  get elementSourceObject(): JsonNode {
    return this._elementSourceObject;
  }
}
