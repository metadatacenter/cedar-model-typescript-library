import { ChoiceOptionEntity } from '../../ChoiceOptionEntity';

export class ListOption extends ChoiceOptionEntity {
  public constructor(label: string, selectedByDefault: boolean) {
    super(label, selectedByDefault);
  }
}
