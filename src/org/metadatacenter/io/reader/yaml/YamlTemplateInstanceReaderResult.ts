import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';
import { YamlArtifactReaderResult } from './YamlArtifactReaderResult';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';

export class YamlTemplateInstanceReaderResult extends YamlArtifactReaderResult {
  constructor(instance: TemplateInstance, parsingResult: YamlArtifactParsingResult, instanceSourceObject: JsonNode) {
    super(instance, parsingResult, instanceSourceObject);
  }

  get instance(): TemplateInstance {
    return this._artifact as TemplateInstance;
  }

  get instanceSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}
