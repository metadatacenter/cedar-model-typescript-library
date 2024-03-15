import { TextFieldBuilder } from '../../model/cedar/field/dynamic/textfield/TextFieldBuilder';
import { TextAreaBuilder } from '../../model/cedar/field/dynamic/textarea/TextAreaBuilder';
import { TemporalFieldBuilder } from '../../model/cedar/field/dynamic/temporal/TemporalFieldBuilder';
import { PhoneNumberFieldBuilder } from '../../model/cedar/field/dynamic/phone-number/PhoneNumberFieldBuilder';

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
}
