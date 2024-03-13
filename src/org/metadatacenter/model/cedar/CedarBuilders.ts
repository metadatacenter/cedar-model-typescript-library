import { TextFieldBuilder } from './field/dynamic/textfield/TextFieldBuilder';

export abstract class CedarBuilders {
  static textFieldBuilder(): TextFieldBuilder {
    return new TextFieldBuilder();
  }
}
