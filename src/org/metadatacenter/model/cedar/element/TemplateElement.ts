import { BiboStatus } from '../types/wrapped-types/BiboStatus';
import { SchemaVersion } from '../types/wrapped-types/SchemaVersion';
import { PavVersion } from '../types/wrapped-types/PavVersion';
import { AbstractContainerArtifact } from '../AbstractContainerArtifact';
import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';

export class TemplateElement extends AbstractContainerArtifact {
  private constructor() {
    super();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_ELEMENT;
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
