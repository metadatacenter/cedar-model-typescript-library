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

const ELEMENT_INSTANCE_TYPE = 'element-instance';

export class YamlTemplateInstanceWriter extends YamlAbstractArtifactWriter {
  private constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: YamlWriterBehavior, writers: CedarYamlWriters): YamlTemplateInstanceWriter {
    return new YamlTemplateInstanceWriter(behavior, writers);
  }

  public getYamlAsJsonNode(instance: TemplateInstance, isCompact: boolean = false): JsonNode {
    AttributeValueNamePolicy.assertValid(instance.dataContainer);
    // build the final object
    return {
      ...this.macroType(instance),
      ...this.macroNameAndDescription(instance),
      // Instance identity is data, not optional provenance. Java keeps it in
      // both expanded and compact YAML so either form round-trips unchanged.
      ...this.macroId(instance, false),
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
    this.serializeDataLevelInto(instance.dataContainer, ret, isCompact);
    return ret;
  }

  private serializeDataLevelInto(dataContainer: InstanceDataContainer, into: JsonNode, isCompact: boolean): void {
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
            if (this.hasId(arrayElement.id)) {
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
      if (this.hasId(dataContainer.id)) {
        into[YamlKeys.id] = dataContainer.id;
      }
      into[YamlKeys.children] = target;
    }
    this.serializeAttributeValueFields(dataContainer, into, unpackedAttributeValueGroups);
  }

  private serializeAttributeValueFields(
    dataContainer: InstanceDataContainer,
    into: JsonNode,
    unpackedGroups: ReadonlyMap<string, string[]>,
  ) {
    Object.keys(dataContainer.values).forEach((key) => {
      const dataAtom: InstanceDataAtomType = dataContainer.values[key];
      if (dataAtom instanceof InstanceDataAttributeValueField) {
        const wrapper: JsonNode = JsonNode.getEmpty();
        let addedav = false;
        Object.keys(dataAtom.values).forEach((subKey) => {
          const atom = dataAtom.values[subKey];
          if (atom instanceof InstanceDataStringAtom) {
            const serialized = this.serializeAtomString(atom);
            if (serialized !== null) {
              wrapper[subKey] = serialized;
              addedav = true;
            }
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
        if (atom instanceof InstanceDataStringAtom) {
          const serialized = this.serializeAtomString(atom);
          if (serialized !== null) {
            wrapper[attributeName] = serialized;
          }
        }
      }
      if (JsonNode.hasEntries(wrapper)) {
        into[groupName] = wrapper;
      }
    }
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
        .filter((name) => name.length > 0);
      if (names.length > 0) {
        groups.set(key, names);
      }
    }
    return groups;
  }

  private serializeCommonType(atom: InstanceDataAtomType, isCompact: boolean): JsonNode | null {
    if (atom instanceof InstanceDataStringAtom) {
      return this.serializeAtomString(atom);
    }
    if (atom instanceof InstanceDataTypedAtom) {
      return atom.value === null ? null : { [YamlKeys.datatype]: atom.type, [YamlKeys.value]: atom.value };
    }
    if (atom instanceof InstanceDataControlledAtom) {
      const controlled: JsonNode = JsonNode.getEmpty();
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
    return atom.value === null ? null : { [YamlKeys.value]: atom.value };
  }

  private serializeAtomLink(atom: InstanceDataLinkAtom): JsonNode | null {
    return this.hasId(atom.id) ? { [YamlKeys.id]: atom.id } : null;
  }

  private hasId(id: string | null): id is string {
    return id !== null && id !== '';
  }
}
