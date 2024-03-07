import { BiboStatus } from '../beans/BiboStatus';
import { SchemaVersion } from '../beans/SchemaVersion';
import { PavVersion } from '../beans/PavVersion';
import { CedarArtifactId } from '../beans/CedarArtifactId';
import { CedarContainerChildrenInfo } from '../beans/CedarContainerChildrenInfo';
import { CedarTemplateChild } from '../util/types/CedarTemplateChild';
import { CedarAbstractArtifact } from '../CedarAbstractArtifact';

export class CedarTemplate extends CedarAbstractArtifact {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  public title: string | null = null;
  public description: string | null = null;
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  public header: string | null = null;
  public footer: string | null = null;
  public schema_identifier: string | null = null;
  public instanceTypeSpecification: string | null = null;
  // Children
  public childrenInfo: CedarContainerChildrenInfo = new CedarContainerChildrenInfo();
  public children: Array<CedarTemplateChild> = [];

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

  addChild(templateChild: CedarTemplateChild): void {
    this.children.push(templateChild);
  }
}
