import { BiboStatus } from '../types/wrapped-types/BiboStatus';
import { SchemaVersion } from '../types/wrapped-types/SchemaVersion';
import { PavVersion } from '../types/wrapped-types/PavVersion';
import { AbstractContainerArtifact } from '../AbstractContainerArtifact';
import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { AbstractChildDeploymentInfoBuilder } from '../deployment/AbstractChildDeploymentInfoBuilder';

export class Template extends AbstractContainerArtifact {
  public header: string | null = null;
  public footer: string | null = null;
  public instanceTypeSpecification: string | null = null;

  private constructor() {
    super();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE;
  }

  public static buildEmptyWithNullValues(): Template {
    return new Template();
  }

  // TODO :probably should be removed
  public static buildEmptyWithDefaultValues(): Template {
    const r = new Template();
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

  createDeploymentBuilder(_childName: string): AbstractChildDeploymentInfoBuilder {
    throw new Error('Method not supported.');
  }
}
