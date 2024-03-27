import { JSONWriterBehavior } from '../../../behavior/JSONWriterBehavior';
import { JSONAtomicWriter } from '../json/JSONAtomicWriter';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { NullableString } from '../../../model/cedar/types/basic-types/NullableString';

export class YAMLAtomicWriter extends JSONAtomicWriter {
  public constructor(behavior: JSONWriterBehavior) {
    super(behavior);
  }

  protected override writeCedarArtifactType(type: CedarArtifactType): NullableString {
    return type.getYamlValue();
  }
}
