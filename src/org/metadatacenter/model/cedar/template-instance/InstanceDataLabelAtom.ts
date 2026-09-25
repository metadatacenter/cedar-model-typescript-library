/** A field carrying a label without an IRI or literal value. */
export class InstanceDataLabelAtom {
  constructor(
    public readonly label: string,
    public readonly type: string | null = null,
  ) {}
}
