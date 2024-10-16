import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { AbstractInstanceArtifact } from '../AbstractInstanceArtifact';
import { InstanceDataContainer } from './InstanceDataContainer';

export class TemplateInstance extends AbstractInstanceArtifact {
  dataContainer: InstanceDataContainer;

  private constructor() {
    super();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_INSTANCE;
    this.dataContainer = new InstanceDataContainer();
  }

  public static buildEmptyWithNullValues(): TemplateInstance {
    return new TemplateInstance();
  }
}
