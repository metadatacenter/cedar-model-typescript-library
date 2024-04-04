import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { JsonArtifactReaderResult } from './JsonArtifactReaderResult';

export class JsonTemplateElementReaderResult extends JsonArtifactReaderResult {
  constructor(element: TemplateElement, parsingResult: ParsingResult, elementSourceObject: JsonNode) {
    super(element, parsingResult, elementSourceObject);
  }

  get element(): TemplateElement {
    return this._artifact as TemplateElement;
  }

  get elementSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}
