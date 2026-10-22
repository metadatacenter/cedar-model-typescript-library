import { TemplateField } from '../field/TemplateField';
import { CedarFieldType } from '../types/cedar-types/CedarFieldType';
import { ValueConstraintsNumericField } from '../field/dynamic/numeric/ValueConstraintsNumericField';
import { ValueConstraintsTemporalField } from '../field/dynamic/temporal/ValueConstraintsTemporalField';
import { InstanceDataStringAtom } from './InstanceDataStringAtom';
import { InstanceDataTypedAtom } from './InstanceDataTypedAtom';
import { TemplateInstance } from './TemplateInstance';
import { InstanceDataContainer } from './InstanceDataContainer';
import { InstanceDataAtomType } from './InstanceDataAtomType';
import { InstanceDataEmptyNode } from './InstanceDataEmptyNode';
import { AbstractContainerArtifact } from '../AbstractContainerArtifact';
import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { TemplateElement } from '../element/TemplateElement';
import { Template } from '../template/Template';
import { AbstractChildDeploymentInfo } from '../deployment/AbstractChildDeploymentInfo';
import { AbstractDynamicChildDeploymentInfo } from '../deployment/AbstractDynamicChildDeploymentInfo';
import { InstanceDataAtomList } from './InstanceDataAtomList';
import { TemplateChild } from '../types/basic-types/TemplateChild';

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
 *    every property the template's JSON Schema requires is present, and a
 *    repeated child short of its lower bound is filled to it.
 *  - **child order** — children are placed in the template's declared order.
 *
 * Values the sparse instance already carries are preserved untouched. Mirrors the
 * Java library's `InstanceInflater`.
 */
export class InstanceInflater {
  private constructor() {}

  /**
   * Complete an instance against its template.
   *
   * A repeated child has the occurrences its lower bound demands, as the Java inflater gives it, so
   * the instance satisfies its template: one the instance omits starts with that many empty ones,
   * and one it holds fewer of keeps its own and gains empty ones after them. An editor that shows a
   * user the instance as stored can ask for `'empty'` instead, and each repeated child then keeps
   * exactly the occurrences the user saw, none for one the instance omits, rather than gaining
   * occurrences the user never created.
   */
  public static inflate(
    instance: TemplateInstance,
    template: Template,
    repeatedChildren: 'lowerBound' | 'empty' = 'lowerBound',
  ): TemplateInstance {
    InstanceInflater.inflateContainer(instance.dataContainer, template, repeatedChildren);
    return instance;
  }

  private static emptyField(field: TemplateField): InstanceDataAtomType {
    if (field.valueConstraints instanceof ValueConstraintsNumericField) {
      return new InstanceDataTypedAtom(null, field.valueConstraints.numberType.getValue() ?? 'xsd:decimal');
    }
    if (field.valueConstraints instanceof ValueConstraintsTemporalField) {
      return new InstanceDataTypedAtom(null, field.valueConstraints.temporalType.getValue() ?? 'xsd:dateTime');
    }
    const iriTypes = [
      CedarFieldType.CONTROLLED_TERM,
      CedarFieldType.LINK,
      CedarFieldType.EXT_ROR,
      CedarFieldType.EXT_ORCID,
      CedarFieldType.EXT_PFAS,
      CedarFieldType.EXT_PUBMED,
      CedarFieldType.EXT_RRID,
      CedarFieldType.EXT_NIH_GRANT_ID,
      CedarFieldType.EXT_DOI,
    ];
    return iriTypes.includes(field.cedarFieldType) ? new InstanceDataEmptyNode() : new InstanceDataStringAtom(null);
  }

  /**
   * The empty occurrences a repeated child holding `held` of them is short of its lower bound, which
   * is the bound both writers state in the template. Every repeated child was given an empty list,
   * so an instance inflated here failed its own template wherever that bound was above zero, and the
   * Java inflater filled it. An attribute-value field gains none whatever its bound, as there,
   * since its attributes need names nobody has given.
   */
  private static missingOccurrences(child: TemplateChild | null, info: AbstractChildDeploymentInfo, held: number): InstanceDataAtomList {
    if (child instanceof TemplateField && child.cedarFieldType === CedarFieldType.ATTRIBUTE_VALUE) {
      return [];
    }
    const stated = info instanceof AbstractDynamicChildDeploymentInfo ? info.minItems : null;
    const count = Math.max(0, (stated ?? AbstractChildDeploymentInfo.defaultMinItems) - held);
    return Array.from({ length: count }, (): InstanceDataAtomType => {
      if (child instanceof TemplateElement) return new InstanceDataContainer();
      if (child instanceof TemplateField) return InstanceInflater.emptyField(child);
      return new InstanceDataEmptyNode();
    });
  }

  private static inflateContainer(
    container: InstanceDataContainer,
    template: AbstractContainerArtifact,
    repeatedChildren: 'lowerBound' | 'empty',
  ): void {
    const info = template.getChildrenInfo();

    const iriMap = info.getChildIriMap();
    Object.keys(iriMap).forEach((name) => container.setIri(name, iriMap[name]));

    const ordered: { [key: string]: InstanceDataAtomType } = {};
    info.getChildrenNames().forEach((name) => {
      const child = template.getChild(name);
      let value: InstanceDataAtomType = container.values[name];
      if (value === undefined) {
        // A static field is not a property of the instance, so it gets no slot.
        // `getChildIriMap` above already refuses it a property IRI for exactly
        // that reason; adding a slot here contradicted it and produced an
        // instance carrying `"Page break 1": {}` — a property with no `@context`
        // entry, which is neither valid JSON-LD nor what CEDAR writes. An
        // instance that genuinely carries one keeps it, through the pass below
        // that preserves what the template does not name.
        if (template.getChildInfo(name)?.atType === CedarArtifactType.STATIC_TEMPLATE_FIELD) {
          return;
        }
        // Missing repeated children (including choice/attribute-value fields and
        // elements) must retain their schema's array shape. Single children
        // need the appropriate literal, IRI, or recursive element shape.
        const childInfo = template.getChildInfo(name);
        if (childInfo?.isMultiInAnyWay()) {
          value = repeatedChildren === 'empty' ? [] : InstanceInflater.missingOccurrences(child, childInfo, 0);
        } else if (child instanceof TemplateElement) {
          value = new InstanceDataContainer();
        } else if (child instanceof TemplateField) {
          value = InstanceInflater.emptyField(child);
        } else {
          value = new InstanceDataEmptyNode();
        }
      } else if (Array.isArray(value) && repeatedChildren === 'lowerBound') {
        // A repeated child the instance holds too few of keeps its occurrences in their places and
        // gains empty ones after them, as the Java inflater fills it.
        const childInfo = template.getChildInfo(name);
        if (childInfo?.isMultiInAnyWay()) {
          value = [...value, ...InstanceInflater.missingOccurrences(child, childInfo, value.length)];
        }
      }
      if (child instanceof TemplateElement) {
        if (value instanceof InstanceDataContainer) {
          InstanceInflater.inflateContainer(value, child, repeatedChildren);
        } else if (Array.isArray(value)) {
          value.forEach((element) => {
            if (element instanceof InstanceDataContainer) {
              InstanceInflater.inflateContainer(element, child, repeatedChildren);
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
