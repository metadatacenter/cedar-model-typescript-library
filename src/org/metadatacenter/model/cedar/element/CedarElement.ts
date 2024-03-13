import { BiboStatus } from '../types/beans/BiboStatus';
import { SchemaVersion } from '../types/beans/SchemaVersion';
import { PavVersion } from '../types/beans/PavVersion';
import { CedarContainerAbstractArtifact } from '../CedarAbstractContainerArtifact';

export class CedarElement extends CedarContainerAbstractArtifact {
  private constructor() {
    super();
  }

  public static buildEmptyWithNullValues(): CedarElement {
    return new CedarElement();
  }

  public static buildEmptyWithDefaultValues(): CedarElement {
    const r = new CedarElement();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    r.bibo_status = BiboStatus.DRAFT;
    r.pav_version = PavVersion.DEFAULT;
    return r;
  }
}
