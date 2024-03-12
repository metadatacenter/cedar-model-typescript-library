import { CedarField } from './CedarField';
import { CedarFieldType } from '../types/beans/CedarFieldType';
import { CedarArtifactType } from '../types/beans/CedarArtifactType';

export class CedarUnknownField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.NULL;
    this.cedarArtifactType = CedarArtifactType.NULL;
  }

  public static build(): CedarUnknownField {
    return new CedarUnknownField();
  }
}
