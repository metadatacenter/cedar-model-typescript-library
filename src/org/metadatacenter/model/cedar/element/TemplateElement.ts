import { BiboStatus } from '../types/wrapped-types/BiboStatus';
import { SchemaVersion } from '../types/wrapped-types/SchemaVersion';
import { PavVersion } from '../types/wrapped-types/PavVersion';
import { AbstractContainerArtifact } from '../AbstractContainerArtifact';

export class TemplateElement extends AbstractContainerArtifact {
  private constructor() {
    super();
  }

  public static buildEmptyWithNullValues(): TemplateElement {
    return new TemplateElement();
  }

  public static buildEmptyWithDefaultValues(): TemplateElement {
    const r = new TemplateElement();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    r.bibo_status = BiboStatus.DRAFT;
    r.pav_version = PavVersion.DEFAULT;
    return r;
  }
}
