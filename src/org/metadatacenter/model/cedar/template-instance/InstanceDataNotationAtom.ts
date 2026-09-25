/** A field carrying notation without an IRI, literal value or label. */
export class InstanceDataNotationAtom {
  constructor(
    public readonly notation: string,
    public readonly type: string | null = null,
  ) {}
}
