import { BiboStatus } from '../types/beans/BiboStatus';
import { SchemaVersion } from '../types/beans/SchemaVersion';
import { PavVersion } from '../types/beans/PavVersion';
import { CedarContainerAbstractArtifact } from '../CedarAbstractContainerArtifact';

export class CedarTemplate extends CedarContainerAbstractArtifact {
  public header: string | null = null;
  public footer: string | null = null;
  public schema_identifier: string | null = null;
  public instanceTypeSpecification: string | null = null;

  private constructor() {
    super();
  }

  public static buildEmptyWithNullValues(): CedarTemplate {
    return new CedarTemplate();
  }

  public static buildEmptyWithDefaultValues(): CedarTemplate {
    const r = new CedarTemplate();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    r.bibo_status = BiboStatus.DRAFT;
    r.pav_version = PavVersion.DEFAULT;
    return r;
  }
}
