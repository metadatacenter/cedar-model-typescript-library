import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';
import { PhoneNumberField } from './PhoneNumberField';

export class PhoneNumberFieldImpl extends TemplateField implements PhoneNumberField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.PHONE_NUMBER;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): PhoneNumberField {
    return new PhoneNumberFieldImpl();
  }
}
