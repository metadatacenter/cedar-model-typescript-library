/** A field carrying a label without an IRI or literal value. */
export class InstanceDataLabelAtom {
  /** Optional SKOS notation, including an explicitly empty string. */
  public notation: string | null = null;
  constructor(
    public readonly label: string,
    public readonly type: string | null = null,
  ) {}
}
