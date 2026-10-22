import { TextPolicy } from '../../../policy/TextPolicy';
import { ReservedNames } from '../../../model/cedar/ReservedNames';
import { InstanceDataNotationAtom } from '../../../model/cedar/template-instance/InstanceDataNotationAtom';
import { InstanceDataLabelAtom } from '../../../model/cedar/template-instance/InstanceDataLabelAtom';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from './CedarYamlWriters';
import { YamlAbstractArtifactWriter } from './YamlAbstractArtifactWriter';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';
import { InstanceDataContainer } from '../../../model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataAtomType } from '../../../model/cedar/template-instance/InstanceDataAtomType';
import { InstanceDataAttributeValueField } from '../../../model/cedar/template-instance/InstanceDataAttributeValueField';
import { InstanceDataStringAtom } from '../../../model/cedar/template-instance/InstanceDataStringAtom';
import { InstanceDataLinkAtom } from '../../../model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataTypedAtom } from '../../../model/cedar/template-instance/InstanceDataTypedAtom';
import { InstanceDataControlledAtom } from '../../../model/cedar/template-instance/InstanceDataControlledAtom';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { AttributeValueNamePolicy } from '../../../model/cedar/template-instance/AttributeValueNamePolicy';
import { InstanceDataAttributeValueFieldName } from '../../../model/cedar/template-instance/InstanceDataAttributeValueFieldName';
import { WriterUtil } from '../WriterUtil';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';

const ELEMENT_INSTANCE_TYPE = 'element-instance';

export class YamlTemplateInstanceWriter extends YamlAbstractArtifactWriter {
  private constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: YamlWriterBehavior, writers: CedarYamlWriters): YamlTemplateInstanceWriter {
    return new YamlTemplateInstanceWriter(behavior, writers);
  }

  public getYamlAsJsonNode(instance: TemplateInstance, isCompact: boolean = false): JsonNode {
    // Java's writer refuses an instance with no name, and both readers refuse a document without one.
    if (instance.schema_name === null) {
      throw new Error('A template instance must have a name.');
    }
    // An instance that does not name its template says nothing of what it is an instance of. Both
    // readers refuse it, and Java cannot build one.
    if (instance.schema_isBasedOn === CedarArtifactId.NULL) {
      throw new Error('A template instance must name the template it is based on.');
    }
    AttributeValueNamePolicy.assertValid(instance.dataContainer);
    // build the final object
    return {
      ...this.macroType(instance),
      ...this.macroNameAndDescription(instance),
      ...this.macroId(instance, isCompact, true),
      ...this.macroIsBasedOn(instance),
      ...this.macroDerivedFrom(instance, isCompact),
      ...this.macroProvenance(instance, isCompact),
      ...this.getDataTree(instance, isCompact),
      ...this.macroAnnotations(instance),
    } as JsonNode;
  }

  public getAsYamlString(instance: TemplateInstance, isCompact: boolean = false): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(instance, isCompact));
  }

  private getDataTree(instance: TemplateInstance, isCompact: boolean): JsonNode {
    const ret: JsonNode = JsonNode.getEmpty();
    this.serializeDataLevelInto(instance.dataContainer, ret, isCompact, true);
    return ret;
  }

  private serializeDataLevelInto(
    dataContainer: InstanceDataContainer,
    into: JsonNode,
    isCompact: boolean,
    isDocumentRoot: boolean = false,
  ): void {
    const target = JsonNode.getEmpty();
    const unpackedAttributeValueGroups = this.getUnpackedAttributeValueGroups(dataContainer);
    const unpackedAttributeNames = new Set(Array.from(unpackedAttributeValueGroups.values()).flat());
    Object.keys(dataContainer.values).forEach((key) => {
      // CEE edits attribute-value fields as a list of name slots plus sibling
      // value atoms. They belong at the container level under their field name,
      // not in `children` as unrelated ordinary fields.
      if (unpackedAttributeValueGroups.has(key) || unpackedAttributeNames.has(key)) {
        return;
      }
      const dataAtom: InstanceDataAtomType = dataContainer.values[key];
      if (Array.isArray(dataAtom)) {
        const dataArray: JsonNode[] = JsonNode.getEmptyList();
        dataAtom.forEach((arrayElement: InstanceDataAtomType, _index: number) => {
          const serializedData: JsonNode | null = this.serializeCommonType(arrayElement, isCompact);
          if (serializedData !== null && JsonNode.hasEntries(serializedData)) {
            dataArray.push(serializedData);
          } else if (arrayElement instanceof InstanceDataContainer) {
            // The number and order of repeated element occurrences is data. An
            // appended-but-empty element therefore cannot disappear, while an
            // empty repeated field can. The discriminator is the same one the
            // Java YAML reader uses to distinguish this stub from a field.
            const stub: JsonNode = { [YamlKeys.type]: ELEMENT_INSTANCE_TYPE };
            if (!isCompact && this.hasId(arrayElement.id)) {
              stub[YamlKeys.id] = arrayElement.id;
            }
            dataArray.push(stub);
          }
        });
        if (dataArray.length > 0) {
          target[key] = dataArray;
        }
      } else {
        const serializedData: JsonNode | null = this.serializeCommonType(dataAtom, isCompact);
        if (serializedData !== null && JsonNode.hasEntries(serializedData)) {
          target[key] = serializedData;
        }
      }
    });

    // A container is meaningful only when it carries a child value or an
    // attribute-value group. Its generated JSON-LD id alone is reconstructable
    // from the template and would be ambiguous with a field in YAML.
    if (JsonNode.hasEntries(target)) {
      if (this.hasId(dataContainer.id) && (!isCompact || isDocumentRoot)) {
        into[YamlKeys.id] = dataContainer.id;
      }
      into[YamlKeys.children] = target;
    }
    const attributes = JsonNode.getEmpty();
    this.serializeAttributeValueFields(dataContainer, attributes, unpackedAttributeValueGroups, isDocumentRoot);
    // Emit element metadata before attribute groups, including elements with no ordinary children.
    if (!isDocumentRoot && (JsonNode.hasEntries(into) || JsonNode.hasEntries(attributes))) {
      if (!Object.hasOwn(into, YamlKeys.children)) {
        into[YamlKeys.type] = ELEMENT_INSTANCE_TYPE;
      }
      if (!isCompact && this.hasId(dataContainer.id)) {
        into[YamlKeys.id] = dataContainer.id;
      }
    }
    Object.assign(into, attributes);
  }

  private serializeAttributeValueFields(
    dataContainer: InstanceDataContainer,
    into: JsonNode,
    unpackedGroups: ReadonlyMap<string, string[]>,
    isDocumentRoot: boolean,
  ) {
    Object.keys(dataContainer.values).forEach((key) => {
      const dataAtom: InstanceDataAtomType = dataContainer.values[key];
      if (
        (dataAtom instanceof InstanceDataAttributeValueField || unpackedGroups.has(key)) &&
        ReservedNames.yamlKeys(isDocumentRoot ? 'template' : 'element').has(key)
      ) {
        throw new Error(`Attribute-value field key "${key}" is reserved for CEDAR YAML metadata.`);
      }
      if (dataAtom instanceof InstanceDataAttributeValueField) {
        const wrapper: JsonNode = JsonNode.getEmpty();
        let addedav = false;
        Object.keys(dataAtom.values).forEach((subKey) => {
          const serialized = this.serializeAttribute(dataAtom.values[subKey]);
          if (serialized !== null) {
            wrapper[subKey] = serialized;
            addedav = true;
          }
        });
        if (addedav) {
          into[key] = wrapper;
        }
      }
    });

    for (const [groupName, attributeNames] of unpackedGroups) {
      const wrapper: JsonNode = JsonNode.getEmpty();
      for (const attributeName of attributeNames) {
        const atom = dataContainer.values[attributeName];
        const serialized = atom === undefined ? null : this.serializeAttribute(atom);
        if (serialized !== null) {
          wrapper[attributeName] = serialized;
        }
      }
      if (JsonNode.hasEntries(wrapper)) {
        into[groupName] = wrapper;
      }
    }
  }

  /**
   * An attribute is written as the field value it is, as Java's writer writes it, so its label,
   * datatype and identifier survive. An attribute that holds nothing is left out, and an element is
   * never an attribute.
   */
  private serializeAttribute(atom: InstanceDataAtomType): JsonNode | null {
    if (atom instanceof InstanceDataContainer) {
      return null;
    }
    const serialized = this.serializeCommonType(atom, false);
    return serialized !== null && JsonNode.hasEntries(serialized) ? serialized : null;
  }

  private getUnpackedAttributeValueGroups(dataContainer: InstanceDataContainer): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    for (const [key, value] of Object.entries(dataContainer.values)) {
      if (!Array.isArray(value)) {
        continue;
      }
      const names = value
        .filter((item): item is InstanceDataAttributeValueFieldName => item instanceof InstanceDataAttributeValueFieldName)
        .map((item) => item.name)
        .filter((name) => !TextPolicy.isBlank(name));
      if (names.length > 0) {
        groups.set(key, names);
      }
    }
    return groups;
  }

  private serializeCommonType(atom: InstanceDataAtomType, isCompact: boolean): JsonNode | null {
    let node = this.serializeCommonTypeWithoutNotation(atom, isCompact);
    if ('notation' in atom && atom.notation !== null) {
      const result = node ?? JsonNode.getEmpty();
      result[YamlKeys.notation] = atom.notation;
      node = result;
    }
    if ('preferredLabel' in atom && atom.preferredLabel !== null) {
      const result = node ?? JsonNode.getEmpty();
      result[YamlKeys.prefLabel] = atom.preferredLabel;
      node = result;
    }
    if (node !== null && 'language' in atom && atom.language !== null) {
      node[YamlKeys.language] = atom.language;
    }
    return node;
  }

  private serializeCommonTypeWithoutNotation(atom: InstanceDataAtomType, isCompact: boolean): JsonNode | null {
    if (atom instanceof InstanceDataNotationAtom) {
      return atom.type === null ? JsonNode.getEmpty() : { [YamlKeys.datatype]: WriterUtil.writtenDatatype(atom.type) };
    }
    if (atom instanceof InstanceDataStringAtom) {
      return this.serializeAtomString(atom);
    }
    if (atom instanceof InstanceDataTypedAtom) {
      return atom.value === null && atom.label === null && atom.notation === null && atom.preferredLabel === null
        ? null
        : {
            [YamlKeys.datatype]: WriterUtil.writtenDatatype(atom.type),
            [YamlKeys.value]: atom.value,
            ...(atom.label === null ? {} : { [YamlKeys.label]: atom.label }),
          };
    }
    if (atom instanceof InstanceDataLabelAtom) {
      return {
        ...(atom.type === null ? {} : { [YamlKeys.datatype]: WriterUtil.writtenDatatype(atom.type) }),
        [YamlKeys.label]: atom.label,
      };
    }
    if (atom instanceof InstanceDataControlledAtom) {
      const controlled: JsonNode = JsonNode.getEmpty();
      if (atom.type !== null && (this.hasId(atom.id) || atom.label !== null || atom.notation !== null)) {
        controlled[YamlKeys.datatype] = WriterUtil.writtenDatatype(atom.type);
      }
      if (this.hasId(atom.id)) {
        controlled[YamlKeys.id] = atom.id;
      }
      if (atom.label !== null) {
        controlled[YamlKeys.label] = atom.label;
      }
      return JsonNode.hasEntries(controlled) ? controlled : null;
    }
    if (atom instanceof InstanceDataLinkAtom) {
      return this.serializeAtomLink(atom);
    }
    if (atom instanceof InstanceDataContainer) {
      const elementContainer: JsonNode = JsonNode.getEmpty();
      this.serializeDataLevelInto(atom, elementContainer, isCompact);
      return elementContainer;
    }

    return null;
  }

  private serializeAtomString(atom: InstanceDataStringAtom): JsonNode | null {
    return atom.value === null && atom.label === null && atom.notation === null && atom.preferredLabel === null
      ? null
      : { [YamlKeys.value]: atom.value, ...(atom.label === null ? {} : { [YamlKeys.label]: atom.label }) };
  }

  private serializeAtomLink(atom: InstanceDataLinkAtom): JsonNode | null {
    return this.hasId(atom.id)
      ? { ...(atom.type === null ? {} : { [YamlKeys.datatype]: WriterUtil.writtenDatatype(atom.type) }), [YamlKeys.id]: atom.id }
      : atom.notation !== null && atom.type !== null
        ? { [YamlKeys.datatype]: WriterUtil.writtenDatatype(atom.type) }
        : null;
  }

  private hasId(id: string | null): id is string {
    return id !== null && id !== '';
  }
}
