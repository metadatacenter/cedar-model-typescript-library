import { TextFieldBuilder } from '../../model/cedar/field/dynamic/textfield/TextFieldBuilder';
import { TextAreaBuilder } from '../../model/cedar/field/dynamic/textarea/TextAreaBuilder';
import { TemporalFieldBuilder } from '../../model/cedar/field/dynamic/temporal/TemporalFieldBuilder';
import { PhoneNumberFieldBuilder } from '../../model/cedar/field/dynamic/phone-number/PhoneNumberFieldBuilder';
import { NumericFieldBuilder } from '../../model/cedar/field/dynamic/numeric/NumericFieldBuilder';
import { EmailFieldBuilder } from '../../model/cedar/field/dynamic/email/EmailFieldBuilder';
import { AttributeValueFieldBuilder } from '../../model/cedar/field/dynamic/attribute-value/AttributeValueFieldBuilder';

export abstract class CedarBuilders {
  static textFieldBuilder(): TextFieldBuilder {
    return new TextFieldBuilder();
  }

  static textAreaBuilder(): TextAreaBuilder {
    return new TextAreaBuilder();
  }

  static temporalFieldBuilder(): TemporalFieldBuilder {
    return new TemporalFieldBuilder();
  }
  static phoneNumberFieldBuilder(): PhoneNumberFieldBuilder {
    return new PhoneNumberFieldBuilder();
  }

  static numericFieldBuilder(): NumericFieldBuilder {
    return new NumericFieldBuilder();
  }

  static emailFieldBuilder(): EmailFieldBuilder {
    return new EmailFieldBuilder();
  }

  static attributeValueFieldBuilder(): AttributeValueFieldBuilder {
    return new AttributeValueFieldBuilder();
  }
}
