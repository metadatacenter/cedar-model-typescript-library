import { InstanceDataStringAtom } from './InstanceDataStringAtom';
import { InstanceDataLinkAtom } from './InstanceDataLinkAtom';
import { InstanceDataContainer } from './InstanceDataContainer';
import { InstanceDataAtomList } from './InstanceDataAtomList';
import { InstanceDataEmptyAtom } from './InstanceDataEmptyAtom';
import { InstanceDataEmptyNode } from './InstanceDataEmptyNode';
import { InstanceDataControlledAtom } from './InstanceDataControlledAtom';
import { InstanceDataTypedAtom } from './InstanceDataTypedAtom';
import { InstanceDataAttributeValueField } from './InstanceDataAttributeValueField';
import { InstanceDataAttributeValueFieldName } from './InstanceDataAttributeValueFieldName';

/**
 * Everything a node in a parsed instance can be.
 *
 * `InstanceDataEmptyNode`, `InstanceDataAttributeValueField` and
 * `InstanceDataAttributeValueFieldName` were absent from this union while the
 * reader returned all three, and it type-checked only because
 * `InstanceDataEmptyAtom` was an empty class — every object type is assignable
 * to `{}`, so the union accepted anything and the omission could not be
 * noticed. Giving `InstanceDataEmptyAtom` a field is what surfaced it.
 *
 * Worth keeping honest: consumers narrow on these with `instanceof`, and a
 * member missing from the union is a case the compiler will not make them
 * handle.
 */
export type InstanceDataAtomType =
  | InstanceDataStringAtom
  | InstanceDataLinkAtom
  | InstanceDataContainer
  | InstanceDataAtomList
  | InstanceDataEmptyAtom
  | InstanceDataEmptyNode
  | InstanceDataControlledAtom
  | InstanceDataTypedAtom
  | InstanceDataAttributeValueField
  | InstanceDataAttributeValueFieldName;
