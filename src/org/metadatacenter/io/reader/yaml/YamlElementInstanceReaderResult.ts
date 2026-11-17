import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ElementInstance } from '../../../model/cedar/template-instance/ElementInstance';
import { YamlArtifactReaderResult } from './YamlArtifactReaderResult';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';

export class YamlElementInstanceReaderResult extends YamlArtifactReaderResult {
  constructor(instance: ElementInstance, parsingResult: YamlArtifactParsingResult, instanceSourceObject: JsonNode) {
    super(instance, parsingResult, instanceSourceObject);
  }

  get instance(): ElementInstance {
    return this._artifact as ElementInstance;
  }

  get instanceSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}
