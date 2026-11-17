import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactReaderResult } from './JsonArtifactReaderResult';
import { ElementInstance } from '../../../model/cedar/template-instance/ElementInstance';

export class JsonElementInstanceReaderResult extends JsonArtifactReaderResult {
  constructor(instance: ElementInstance, parsingResult: JsonArtifactParsingResult, instanceSourceObject: JsonNode) {
    super(instance, parsingResult, instanceSourceObject);
  }

  get instance(): ElementInstance {
    return this._artifact as ElementInstance;
  }

  get instanceSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}
