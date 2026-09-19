export class ChoiceOptionEntity {
  public label: string;
  public selectedByDefault: boolean;

  /**
   * Whether the source stated the selection at all.
   *
   * Saying nothing and saying `false` mean the same thing to a reader of the artifact, but not to
   * a validator: the CEDAR meta-schema declares the literals array `uniqueItems`, so a list
   * holding both `{"label": "X"}` and `{"label": "X", "selectedByDefault": false}` is two entries.
   * Writing the second as the first makes them one repeated value, which fails that rule and takes
   * the whole field down with it, turning a valid template into an invalid one.
   */
  public statesSelectedByDefault: boolean;

  protected constructor(label: string, selectedByDefault: boolean, statesSelectedByDefault: boolean = true) {
    this.label = label;
    this.selectedByDefault = selectedByDefault;
    this.statesSelectedByDefault = statesSelectedByDefault;
  }
}
