import { CedarArtifactId } from './types/cedar-types/CedarArtifactId';
import { AbstractArtifact } from './AbstractArtifact';

export abstract class AbstractInstanceArtifact extends AbstractArtifact {
  public schema_isBasedOn: CedarArtifactId = CedarArtifactId.NULL;
}
