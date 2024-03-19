import { ChoiceOptionEntity } from '../../ChoiceOptionEntity';

export class CheckboxOption extends ChoiceOptionEntity {
  public constructor(label: string, selectedByDefault: boolean) {
    super(label, selectedByDefault);
  }
}
