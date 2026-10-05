/** A field carrying notation without an IRI, literal value or label. */
export class InstanceDataNotationAtom {
  /** Optional JSON-LD language tag, preserved across JSON and YAML. */
  public language: string | null = null;
  /** Optional SKOS preferred label, the vocabulary's own name for the value. */
  public preferredLabel: string | null = null;
  constructor(
    public readonly notation: string,
    public readonly type: string | null = null,
  ) {}
}
