export class ChoiceOptionEntity {
  public label: string;
  public selectedByDefault: boolean;

  protected constructor(label: string, selectedByDefault: boolean) {
    this.label = label;
    this.selectedByDefault = selectedByDefault;
  }
}
