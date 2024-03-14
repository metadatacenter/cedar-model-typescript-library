import { TextFieldBuilder } from './field/dynamic/textfield/TextFieldBuilder';
import { TextAreaBuilder } from './field/dynamic/textarea/TextAreaBuilder';

export abstract class CedarBuilders {
  static textFieldBuilder(): TextFieldBuilder {
    return new TextFieldBuilder();
  }

  static textAreaBuilder(): TextAreaBuilder {
    return new TextAreaBuilder();
  }
}
