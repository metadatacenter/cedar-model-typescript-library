import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { AbstractArtifact } from '../AbstractArtifact';
import { InstanceDataContainer } from './InstanceDataContainer';

/**
 * An element instance read or written on its own, outside the template instance that would hold it, as
 * Java's `ElementInstanceArtifact` is. It names no template, and its data is one element occurrence:
 * the same `InstanceDataContainer` a template instance holds for a nested element, whose `id` is the
 * element instance's identifier and whose `types` are the classes it states.
 */
export class ElementInstance extends AbstractArtifact {
  dataContainer: InstanceDataContainer;

  /**
   * Whether the source stated no description. Java's model keeps a description only when one is
   * stated, and writes one only then, while this model holds an empty one in its place.
   */
  descriptionWasAbsent: boolean = true;

  private constructor() {
    super();
    this.cedarArtifactType = CedarArtifactType.ELEMENT_INSTANCE;
    this.dataContainer = new InstanceDataContainer();
  }

  public static buildEmptyWithNullValues(): ElementInstance {
    return new ElementInstance();
  }
}
