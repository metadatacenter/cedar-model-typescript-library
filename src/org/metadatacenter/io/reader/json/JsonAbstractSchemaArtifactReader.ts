import { SchemaExtensions } from '../../../model/cedar/SchemaExtensions';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { AbstractSchemaArtifact, internalNameFor, SchemaArtifactKind } from '../../../model/cedar/AbstractSchemaArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { JsonArtifactReaderResult } from './JsonArtifactReaderResult';
import { JsonAbstractArtifactReader } from './JsonAbstractArtifactReader';

export abstract class JsonAbstractSchemaArtifactReader extends JsonAbstractArtifactReader {
  protected constructor(behavior: JsonReaderBehavior) {
    super(behavior);
  }

  public abstract readFromString(artifactSourceString: string): JsonArtifactReaderResult;

  /** The word a composed title puts between the artifact's name and "schema". */
  protected abstract artifactTypeWord(): SchemaArtifactKind;

  protected readNonReportableAttributes(container: AbstractSchemaArtifact, sourceObject: JsonNode): void {
    container.extensions = SchemaExtensions.fromJson(sourceObject);
    super.readNonReportableAttributes(container, sourceObject);
    // `title` is composed from the name, not read: it names the JSON Schema constraining instances
    // of the artifact and says nothing an author decided. Reading whatever a document supplied let
    // the same artifact be read one way from JSON and another from YAML, where it has always been
    // composed. `description` is the author's and is read.
    container.title = container.schema_name === null ? null : internalNameFor(container.schema_name, this.artifactTypeWord());
    container.description = ReaderUtil.getString(sourceObject, TemplateProperty.description);
    container.schema_schemaVersion = SchemaVersion.forValue(ReaderUtil.getString(sourceObject, JsonSchema.schemaVersion));
    container.pav_version = PavVersion.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavVersion));
    container.bibo_status = BiboStatus.forJsonValue(ReaderUtil.getString(sourceObject, JsonSchema.biboStatus));
    // Older Designer/exporter generations wrote an empty string when no source artifact existed.
    // CedarArtifactId maps that legacy spelling to NULL, and the writer then omits the optional key.
    // Do not reject it at the read boundary: production artifacts must remain openable.
    container.pav_derivedFrom = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavDerivedFrom));
    container.pav_previousVersion = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavPreviousVersion));
    container.schema_identifier = ReaderUtil.getString(sourceObject, JsonSchema.schemaIdentifier);
  }
}
