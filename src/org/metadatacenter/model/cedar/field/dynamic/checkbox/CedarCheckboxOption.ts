export class CedarCheckboxOption {
  public label: string;
  public selectedByDefault: boolean;

  public constructor(label: string, selectedByDefault: boolean) {
    this.label = label;
    this.selectedByDefault = selectedByDefault;
  }
}
