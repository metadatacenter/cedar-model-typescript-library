export const JSONWriterBehaviorValues = {
  STRICT: 'strict',
  FEBRUARY_2024: 'february-2024',
} as const;

export type JSONWriterBehaviorValue = (typeof JSONWriterBehaviorValues)[keyof typeof JSONWriterBehaviorValues] | null;

export class JSONWriterBehavior {
  private readonly value: JSONWriterBehaviorValue | null;
  private readonly _outputPages: boolean;
  private readonly _usePropertiesAtLanguage: boolean;
  private readonly _includeChildrenAsRequired: boolean;

  private constructor(
    value: JSONWriterBehaviorValue,
    outputPages: boolean,
    usePropertiesAtLanguage: boolean,
    includeChildrenAsRequired: boolean,
  ) {
    this.value = value;
    this._outputPages = outputPages;
    this._usePropertiesAtLanguage = usePropertiesAtLanguage;
    this._includeChildrenAsRequired = includeChildrenAsRequired;
  }

  public getValue(): JSONWriterBehaviorValue {
    return this.value;
  }

  public static STRICT = new JSONWriterBehavior(JSONWriterBehaviorValues.STRICT, false, true, true);
  public static FEBRUARY_2024 = new JSONWriterBehavior(JSONWriterBehaviorValues.FEBRUARY_2024, true, false, false);

  public outputPages() {
    return this._outputPages;
  }

  usePropertiesAtLanguage() {
    return this._usePropertiesAtLanguage;
  }

  includeChildrenAsRequired() {
    return this._includeChildrenAsRequired;
  }
}
