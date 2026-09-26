import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { AbstractInstanceArtifact } from '../AbstractInstanceArtifact';
import { InstanceDataContainer } from './InstanceDataContainer';

export class TemplateInstance extends AbstractInstanceArtifact {
  dataContainer: InstanceDataContainer;

  /** Reader provenance used only to match Java's position for a synthesized empty description. */
  descriptionWasAbsent: boolean = false;

  private constructor() {
    super();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_INSTANCE;
    this.dataContainer = new InstanceDataContainer();
  }

  public static buildEmptyWithNullValues(): TemplateInstance {
    return new TemplateInstance();
  }
}
