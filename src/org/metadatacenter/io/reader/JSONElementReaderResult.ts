import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarElement } from '../../model/cedar/element/CedarElement';

export class JSONElementReaderResult {
  private readonly _element: CedarElement;
  private readonly _parsingResult: ParsingResult;
  private readonly _elementSourceObject: JsonNode;

  constructor(element: CedarElement, parsingResult: ParsingResult, elementSourceObject: JsonNode) {
    this._element = element;
    this._parsingResult = parsingResult;
    this._elementSourceObject = elementSourceObject;
  }

  get element(): CedarElement {
    return this._element;
  }

  get parsingResult(): ParsingResult {
    return this._parsingResult;
  }

  get elementSourceObject(): JsonNode {
    return this._elementSourceObject;
  }
}
