import { ChoiceOptionEntity } from '../../ChoiceOptionEntity';

export class RadioOption extends ChoiceOptionEntity {
  public constructor(label: string, selectedByDefault: boolean, statesSelectedByDefault: boolean = true) {
    super(label, selectedByDefault, statesSelectedByDefault);
  }
}
