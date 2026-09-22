import { ChoiceOptionEntity } from '../../ChoiceOptionEntity';

export class CheckboxOption extends ChoiceOptionEntity {
  public constructor(label: string, selectedByDefault: boolean, statesSelectedByDefault: boolean = true) {
    super(label, selectedByDefault, statesSelectedByDefault);
  }
}
