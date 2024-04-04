import { PavVersion } from './types/wrapped-types/PavVersion';
import { BiboStatus } from './types/wrapped-types/BiboStatus';
import { CedarArtifactId } from './types/cedar-types/CedarArtifactId';
import { SchemaVersion } from './types/wrapped-types/SchemaVersion';
import { Annotations } from './annotation/Annotations';
import { NullableString } from './types/basic-types/NullableString';
import { AbstractArtifact } from './AbstractArtifact';

export abstract class AbstractSchemaArtifact extends AbstractArtifact {
  public title: NullableString = null;
  public description: NullableString = null;
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  // status and version
  public pav_version: PavVersion = PavVersion.NULL;
  public bibo_status: BiboStatus = BiboStatus.NULL;

  public schema_identifier: NullableString = null;
  //
  public pav_derivedFrom: CedarArtifactId = CedarArtifactId.NULL;
  //
  public annotations: Annotations | null = null;
}
