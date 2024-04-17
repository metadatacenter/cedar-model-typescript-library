import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';

export class YamlTemplateElementReaderResult {
  private readonly _element: TemplateElement;
  private readonly _parsingResult: YamlArtifactParsingResult;
  private readonly _elementSourceObject: JsonNode;

  constructor(element: TemplateElement, parsingResult: YamlArtifactParsingResult, elementSourceObject: JsonNode) {
    this._element = element;
    this._parsingResult = parsingResult;
    this._elementSourceObject = elementSourceObject;
  }

  get element(): TemplateElement {
    return this._element;
  }

  get parsingResult(): YamlArtifactParsingResult {
    return this._parsingResult;
  }

  get elementSourceObject(): JsonNode {
    return this._elementSourceObject;
  }
}
