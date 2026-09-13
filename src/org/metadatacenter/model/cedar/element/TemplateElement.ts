import { BiboStatus } from '../types/wrapped-types/BiboStatus';
import { SchemaVersion } from '../types/wrapped-types/SchemaVersion';
import { PavVersion } from '../types/wrapped-types/PavVersion';
import { AbstractContainerArtifact } from '../AbstractContainerArtifact';
import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { ChildDeploymentInfoElementBuilder } from '../deployment/ChildDeploymentInfoElementBuilder';

export class TemplateElement extends AbstractContainerArtifact {
  public skos_altLabel: Array<string> | null = null;
  public skos_prefLabel: string | null = null;
  /**
   * The instructions an element shows above and below its fields.
   * `templateElementUIFieldContent` declares both, and the metadata editor renders them when the
   * element is expanded, so an element that arrives with either keeps it through both
   * serializations.
   */
  public header: string | null = null;
  public footer: string | null = null;
  private constructor() {
    super();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_ELEMENT;
  }

  public static buildEmptyWithNullValues(): TemplateElement {
    return new TemplateElement();
  }

  // TODO :probably should be removed
  public static buildEmptyWithDefaultValues(): TemplateElement {
    const r = new TemplateElement();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    r.bibo_status = BiboStatus.DRAFT;
    r.pav_version = PavVersion.DEFAULT;
    return r;
  }

  override isMultiInstanceByDefinition(): boolean {
    return false;
  }

  override isSingleInstanceByDefinition(): boolean {
    return false;
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoElementBuilder {
    return new ChildDeploymentInfoElementBuilder(this, childName);
  }
}
