import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { AbstractArtifact } from '../../../model/cedar/AbstractArtifact';

export abstract class JsonArtifactReaderResult {
  protected readonly _artifact: AbstractArtifact;
  private readonly _parsingResult: ParsingResult;
  protected readonly _artifactSourceObject: JsonNode;

  constructor(artifact: AbstractArtifact, parsingResult: ParsingResult, artifactSourceObject: JsonNode) {
    this._artifact = artifact;
    this._parsingResult = parsingResult;
    this._artifactSourceObject = artifactSourceObject;
  }

  get artifact(): AbstractArtifact {
    return this._artifact;
  }

  get parsingResult(): ParsingResult {
    return this._parsingResult;
  }

  get artifactSourceObject(): JsonNode {
    return this._artifactSourceObject;
  }
}
