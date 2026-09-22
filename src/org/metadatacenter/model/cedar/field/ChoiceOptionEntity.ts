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

  /**
   * A choice must name itself.
   *
   * The label is the value an instance stores when this option is picked, so a blank one offers a
   * choice whose answer cannot be told from no answer at all. What such an option reaches for —
   * that the field may be left alone — is already `requiredValue: false`, and the meta-schema
   * requires a label of at least one character.
   */
  protected constructor(label: string, selectedByDefault: boolean, statesSelectedByDefault: boolean = true) {
    if (label === null || label === undefined || label === '') {
      throw new Error('A permitted value requires a label. A choice that names nothing cannot be chosen.');
    }
    this.label = label;
    this.selectedByDefault = selectedByDefault;
    this.statesSelectedByDefault = statesSelectedByDefault;
  }
}
