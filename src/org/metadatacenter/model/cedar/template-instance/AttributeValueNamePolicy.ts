import { AttributeValueFieldParent, ReservedNames } from '../ReservedNames';
import { InstanceDataAtomType } from './InstanceDataAtomType';
import { InstanceDataAttributeValueField } from './InstanceDataAttributeValueField';
import { InstanceDataAttributeValueFieldName } from './InstanceDataAttributeValueFieldName';
import { InstanceDataContainer } from './InstanceDataContainer';

/**
 * What makes a name unusable: `reserved` and `reservedField` are {@link ReservedNames}' rules for an
 * attribute name and for the attribute-value field's own key; the other two are collisions within one
 * object.
 */
export type AttributeValueNameConflictKind = 'reserved' | 'reservedField' | 'sibling' | 'duplicate';

export interface AttributeValueNameConflict {
  readonly kind: AttributeValueNameConflictKind;
  readonly name: string;
  readonly groupName: string;
  readonly path: ReadonlyArray<string | number>;
  readonly conflictingGroupName?: string;
}

/**
 * The names invented by an attribute-value field become properties of the
 * enclosing JSON object. They therefore share one namespace with every normal
 * child and with the document keys that wrap those children.
 */
export class AttributeValueNamePolicy {
  private constructor() {}

  public static isReserved(name: string): boolean {
    return ReservedNames.isReservedName(name);
  }

  /** `parent` says what `container` is: a template instance's root, or an element inside its parent. */
  public static findConflicts(
    container: InstanceDataContainer,
    parent: AttributeValueFieldParent = 'template',
  ): AttributeValueNameConflict[] {
    const conflicts: AttributeValueNameConflict[] = [];
    AttributeValueNamePolicy.scanContainer(container, [], conflicts, parent);
    return conflicts;
  }

  /** Where a conflict sits: the field itself for a reserved field name, otherwise its attribute. */
  public static locationOf(conflict: AttributeValueNameConflict): Array<string | number> {
    return conflict.kind === 'reservedField'
      ? [...conflict.path, conflict.groupName]
      : [...conflict.path, conflict.groupName, conflict.name];
  }

  public static assertValid(container: InstanceDataContainer): void {
    const conflict = AttributeValueNamePolicy.findConflicts(container)[0];
    if (conflict === undefined) {
      return;
    }
    const location = AttributeValueNamePolicy.locationOf(conflict).join('/');
    if (conflict.kind === 'reservedField') {
      throw new Error(`Attribute-value field name "${conflict.name}" at /${location} is reserved for CEDAR instance metadata`);
    }
    const reason =
      conflict.kind === 'reserved'
        ? 'is reserved for instance metadata'
        : conflict.kind === 'sibling'
          ? 'collides with another child in the same object'
          : `is also used by attribute-value field "${conflict.conflictingGroupName}"`;
    throw new Error(`Attribute-value name "${conflict.name}" at /${location} ${reason}`);
  }

  private static scanContainer(
    container: InstanceDataContainer,
    path: Array<string | number>,
    conflicts: AttributeValueNameConflict[],
    parent: AttributeValueFieldParent,
  ): void {
    for (const name of Object.keys(container.values)) ReservedNames.requireChildName(name);
    const groups = AttributeValueNamePolicy.attributeValueGroups(container);
    const groupNames = new Set(groups.map((group) => group.name));
    const unpackedNames = new Set(groups.filter((group) => group.unpacked).flatMap((group) => group.attributeNames));
    const siblingNames = new Set(Object.keys(container.values).filter((name) => !groupNames.has(name) && !unpackedNames.has(name)));
    const firstGroupForAttribute = new Map<string, string>();

    for (const group of groups) {
      if (ReservedNames.isReservedAttributeValueFieldName(group.name, parent)) {
        conflicts.push({ kind: 'reservedField', name: group.name, groupName: group.name, path });
      }
      const namesInGroup = new Set<string>();
      for (const name of group.attributeNames) {
        if (name.length === 0) {
          continue;
        }
        if (AttributeValueNamePolicy.isReserved(name)) {
          conflicts.push({ kind: 'reserved', name, groupName: group.name, path });
        }
        if (siblingNames.has(name) || groupNames.has(name)) {
          conflicts.push({ kind: 'sibling', name, groupName: group.name, path });
        }
        if (namesInGroup.has(name)) {
          conflicts.push({ kind: 'duplicate', name, groupName: group.name, path, conflictingGroupName: group.name });
        } else {
          namesInGroup.add(name);
        }
        const firstGroup = firstGroupForAttribute.get(name);
        if (firstGroup !== undefined && firstGroup !== group.name) {
          conflicts.push({ kind: 'duplicate', name, groupName: group.name, path, conflictingGroupName: firstGroup });
        } else {
          firstGroupForAttribute.set(name, group.name);
        }
      }
    }

    for (const [name, value] of Object.entries(container.values)) {
      if (groupNames.has(name) || unpackedNames.has(name)) {
        continue;
      }
      AttributeValueNamePolicy.scanValue(value, [...path, name], conflicts);
    }
  }

  private static scanValue(value: InstanceDataAtomType, path: Array<string | number>, conflicts: AttributeValueNameConflict[]): void {
    if (value instanceof InstanceDataContainer) {
      AttributeValueNamePolicy.scanContainer(value, path, conflicts, 'element');
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => AttributeValueNamePolicy.scanValue(item, [...path, index], conflicts));
    }
  }

  private static attributeValueGroups(
    container: InstanceDataContainer,
  ): Array<{ name: string; attributeNames: string[]; unpacked: boolean }> {
    const groups: Array<{ name: string; attributeNames: string[]; unpacked: boolean }> = [];
    for (const [name, value] of Object.entries(container.values)) {
      if (value instanceof InstanceDataAttributeValueField) {
        groups.push({ name, attributeNames: Object.keys(value.values), unpacked: false });
      } else if (Array.isArray(value)) {
        const attributeNames = value
          .filter((item): item is InstanceDataAttributeValueFieldName => item instanceof InstanceDataAttributeValueFieldName)
          .map((item) => item.name);
        if (attributeNames.length > 0) {
          groups.push({ name, attributeNames, unpacked: true });
        }
      }
    }
    return groups;
  }
}
