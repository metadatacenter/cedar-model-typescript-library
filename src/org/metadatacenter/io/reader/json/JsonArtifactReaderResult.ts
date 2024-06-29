import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { AbstractArtifact } from '../../../model/cedar/AbstractArtifact';

export abstract class JsonArtifactReaderResult {
  protected readonly _artifact: AbstractArtifact;
  private readonly _parsingResult: JsonArtifactParsingResult;
  protected readonly _artifactSourceObject: JsonNode;

  protected constructor(artifact: AbstractArtifact, parsingResult: JsonArtifactParsingResult, artifactSourceObject: JsonNode) {
    this._artifact = artifact;
    this._parsingResult = parsingResult;
    this._artifactSourceObject = artifactSourceObject;
  }

  get artifact(): AbstractArtifact {
    return this._artifact;
  }

  get parsingResult(): JsonArtifactParsingResult {
    return this._parsingResult;
  }

  get artifactSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}
