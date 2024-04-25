import { PavVersion } from './types/wrapped-types/PavVersion';
import { BiboStatus } from './types/wrapped-types/BiboStatus';
import { CedarArtifactId } from './types/cedar-types/CedarArtifactId';
import { SchemaVersion } from './types/wrapped-types/SchemaVersion';
import { Annotations } from './annotation/Annotations';
import { NullableString } from './types/basic-types/NullableString';
import { AbstractArtifact } from './AbstractArtifact';
import { AbstractChildDeploymentInfoBuilder } from './deployment/AbstractChildDeploymentInfoBuilder';
import { Language } from './types/wrapped-types/Language';

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
  public pav_previousVersion: CedarArtifactId = CedarArtifactId.NULL;
  //
  public language: Language = Language.NULL;
  //
  public annotations: Annotations | null = null;

  abstract isMultiInstanceByDefinition(): boolean;

  abstract isSingleInstanceByDefinition(): boolean;

  abstract createDeploymentBuilder(childName: string): AbstractChildDeploymentInfoBuilder;
}
