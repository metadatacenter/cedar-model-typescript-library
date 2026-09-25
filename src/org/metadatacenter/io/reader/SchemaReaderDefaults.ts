import { AbstractSchemaArtifact } from '../../model/cedar/AbstractSchemaArtifact';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { JsonPath } from '../../model/cedar/util/path/JsonPath';
import { PavVersion } from '../../model/cedar/types/wrapped-types/PavVersion';
import { BiboStatus } from '../../model/cedar/types/wrapped-types/BiboStatus';

/** Java's ArtifactDefaults applies only at the document root; nested absence is meaningful. */
export function applySchemaReaderDefaults(
  artifact: AbstractSchemaArtifact,
  source: JsonNode,
  path: JsonPath,
  format: 'json' | 'yaml',
): void {
  if (!path.equal(new JsonPath())) return;
  const versionKey = format === 'json' ? 'pav:version' : 'version';
  const statusKey = format === 'json' ? 'bibo:status' : 'status';
  if (source[versionKey] == null) artifact.pav_version = PavVersion.DEFAULT;
  if (source[statusKey] == null) artifact.bibo_status = BiboStatus.DRAFT;
}
