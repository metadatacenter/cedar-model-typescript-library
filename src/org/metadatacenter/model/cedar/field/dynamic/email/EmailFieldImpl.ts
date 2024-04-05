import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';
import { EmailField } from './EmailField';

export class EmailFieldImpl extends TemplateField implements EmailField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EMAIL;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): EmailField {
    return new EmailFieldImpl();
  }
}
