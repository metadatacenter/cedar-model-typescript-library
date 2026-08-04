import { TemplateInstance } from './TemplateInstance';
import { InstanceDataContainer } from './InstanceDataContainer';
import { InstanceDataAtomType } from './InstanceDataAtomType';
import { InstanceDataEmptyNode } from './InstanceDataEmptyNode';
import { AbstractContainerArtifact } from '../AbstractContainerArtifact';
import { TemplateElement } from '../element/TemplateElement';
import { Template } from '../template/Template';

/**
 * Reconstruct a complete instance from a sparse one and its template.
 *
 * The YAML serialization is lean: it drops the JSON-LD `@context` (the property
 * IRIs) and omits fields with no value, and it need not order children the way
 * the template does. None of that is in the instance to recover — it is template
 * data. This bridges the two, so an instance read from YAML can be written back
 * as a valid CEDAR JSON instance:
 *
 *  - **`@context` IRIs** — each child's property IRI is copied onto the
 *    instance's data container (`dataContainer.iris`), which is what the JSON
 *    instance writer builds the `@context` from. Without them the emitted
 *    `@context` has no per-property entries and the instance is not valid JSON-LD.
 *  - **empty slots** — a child the sparse instance omitted is re-added empty, so
 *    every property the template's JSON Schema requires is present.
 *  - **child order** — children are placed in the template's declared order.
 *
 * Values the sparse instance already carries are preserved untouched. Mirrors the
 * Java library's `InstanceInflater`.
 */
export class InstanceInflater {
  private constructor() {}

  public static inflate(instance: TemplateInstance, template: Template): TemplateInstance {
    InstanceInflater.inflateContainer(instance.dataContainer, template);
    return instance;
  }

  private static inflateContainer(container: InstanceDataContainer, template: AbstractContainerArtifact): void {
    const info = template.getChildrenInfo();

    const iriMap = info.getChildIriMap();
    Object.keys(iriMap).forEach((name) => container.setIri(name, iriMap[name]));

    const ordered: { [key: string]: InstanceDataAtomType } = {};
    info.getChildrenNames().forEach((name) => {
      const child = template.getChild(name);
      let value: InstanceDataAtomType = container.values[name];
      if (value === undefined) {
        value = new InstanceDataEmptyNode();
      }
      if (child instanceof TemplateElement) {
        if (value instanceof InstanceDataContainer) {
          InstanceInflater.inflateContainer(value, child);
        } else if (Array.isArray(value)) {
          value.forEach((element) => {
            if (element instanceof InstanceDataContainer) {
              InstanceInflater.inflateContainer(element, child);
            }
          });
        }
      }
      ordered[name] = value;
    });

    // Keep anything the template does not name — an attribute-value field's
    // attributes, say — ahead of nothing being lost, in its existing place.
    Object.keys(container.values).forEach((name) => {
      if (!Object.hasOwn(ordered, name)) {
        ordered[name] = container.values[name];
      }
    });

    container.values = ordered;
  }
}
