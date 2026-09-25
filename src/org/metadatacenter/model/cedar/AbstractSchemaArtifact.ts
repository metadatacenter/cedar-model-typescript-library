import { SchemaExtensions } from './SchemaExtensions';
import { PavVersion } from './types/wrapped-types/PavVersion';
import { BiboStatus } from './types/wrapped-types/BiboStatus';
import { CedarArtifactId } from './types/cedar-types/CedarArtifactId';
import { SchemaVersion } from './types/wrapped-types/SchemaVersion';
import { NullableString } from './types/basic-types/NullableString';
import { AbstractArtifact } from './AbstractArtifact';
import { AbstractChildDeploymentInfoBuilder } from './deployment/AbstractChildDeploymentInfoBuilder';
import { Language } from './types/wrapped-types/Language';

/** The kinds of schema artifact, as a composed title names them. */
export type SchemaArtifactKind = 'template' | 'element' | 'field';

/**
 * The title an artifact of this kind and name has.
 *
 * Composed rather than stored: it restates the artifact's own name and says what kind of thing the
 * name belongs to, so it carries nothing an author decided. A document supplying some other title
 * describes the same schema by another name, and reading that name back let two artifacts with the
 * same name and kind disagree about what their JSON Schema is called. Both readers compose it here,
 * so neither can derive a different one, and the string matches what the Java library builds.
 */
export function internalNameFor(name: string, kind: SchemaArtifactKind): string {
  return `${name} ${kind} schema`;
}

export abstract class AbstractSchemaArtifact extends AbstractArtifact {
  public extensions: SchemaExtensions = new SchemaExtensions();
  public title: NullableString = null;
  public description: NullableString = null;
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  // status and version
  public pav_version: PavVersion = PavVersion.NULL;
  public bibo_status: BiboStatus = BiboStatus.NULL;

  public schema_identifier: NullableString = null;
  //
  public pav_previousVersion: CedarArtifactId = CedarArtifactId.NULL;
  //
  public language: Language = Language.NULL;

  abstract isMultiInstanceByDefinition(): boolean;

  abstract isSingleInstanceByDefinition(): boolean;

  abstract createDeploymentBuilder(childName: string): AbstractChildDeploymentInfoBuilder;
}
