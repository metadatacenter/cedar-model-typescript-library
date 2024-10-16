import { InstanceDataStringAtom } from './InstanceDataStringAtom';
import { InstanceDataLinkAtom } from './InstanceDataLinkAtom';
import { InstanceDataContainer } from './InstanceDataContainer';
import { InstanceDataAtomList } from './InstanceDataAtomList';
import { InstanceDataEmptyAtom } from './InstanceDataEmptyAtom';
import { InstanceDataControlledAtom } from './InstanceDataControlledAtom';
import { InstanceDataTypedAtom } from './InstanceDataTypedAtom';

export type InstanceDataAtomType =
  | InstanceDataStringAtom
  | InstanceDataLinkAtom
  | InstanceDataContainer
  | InstanceDataAtomList
  | InstanceDataEmptyAtom
  | InstanceDataControlledAtom
  | InstanceDataTypedAtom;
