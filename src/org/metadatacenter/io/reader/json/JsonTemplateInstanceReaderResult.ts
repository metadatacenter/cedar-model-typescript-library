import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactReaderResult } from './JsonArtifactReaderResult';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';

export class JsonTemplateInstanceReaderResult extends JsonArtifactReaderResult {
  constructor(instance: TemplateInstance, parsingResult: ParsingResult, instanceSourceObject: JsonNode) {
    super(instance, parsingResult, instanceSourceObject);
  }

  get instance(): TemplateInstance {
    return this._artifact as TemplateInstance;
  }

  get instanceSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}
