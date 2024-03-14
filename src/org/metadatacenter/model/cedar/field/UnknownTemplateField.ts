import { TemplateField } from './TemplateField';
import { CedarFieldType } from '../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';

export class UnknownTemplateField extends TemplateField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.NULL;
    this.cedarArtifactType = CedarArtifactType.NULL;
  }

  public static build(): UnknownTemplateField {
    return new UnknownTemplateField();
  }
}
