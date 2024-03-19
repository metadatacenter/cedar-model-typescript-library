import { ChoiceOptionEntity } from '../../ChoiceOptionEntity';

export class RadioOption extends ChoiceOptionEntity {
  public constructor(label: string, selectedByDefault: boolean) {
    super(label, selectedByDefault);
  }
}
