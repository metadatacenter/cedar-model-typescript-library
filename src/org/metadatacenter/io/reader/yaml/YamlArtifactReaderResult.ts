import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { AbstractArtifact } from '../../../model/cedar/AbstractArtifact';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';

export abstract class YamlArtifactReaderResult {
  protected readonly _artifact: AbstractArtifact;
  private readonly _parsingResult: YamlArtifactParsingResult;
  protected readonly _artifactSourceObject: JsonNode;

  protected constructor(artifact: AbstractArtifact, parsingResult: YamlArtifactParsingResult, artifactSourceObject: JsonNode) {
    this._artifact = artifact;
    this._parsingResult = parsingResult;
    this._artifactSourceObject = artifactSourceObject;
  }

  get artifact(): AbstractArtifact {
    return this._artifact;
  }

  get parsingResult(): YamlArtifactParsingResult {
    return this._parsingResult;
  }

  get artifactSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}
