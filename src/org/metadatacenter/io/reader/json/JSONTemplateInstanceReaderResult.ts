import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JSONArtifactReaderResult } from './JSONArtifactReaderResult';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';

export class JSONTemplateInstanceReaderResult extends JSONArtifactReaderResult {
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
