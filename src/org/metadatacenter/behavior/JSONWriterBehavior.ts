import { ReaderWriterBehavior } from './ReaderWriterBehavior';

export const JSONWriterBehaviorValues = {
  STRICT: 'strict',
  FEBRUARY_2024: 'february-2024',
} as const;

export type JSONWriterBehaviorValue = (typeof JSONWriterBehaviorValues)[keyof typeof JSONWriterBehaviorValues] | null;

export class JSONWriterBehavior extends ReaderWriterBehavior {
  private readonly value: JSONWriterBehaviorValue | null;
  private readonly _outputPages: boolean;
  private readonly _usePropertiesAtLanguage: boolean;
  private readonly _includeSkosNotationForLinksAndControlled: boolean;
  private readonly _includeOnlyElementsInPropertiesContextRequired: boolean;

  private constructor(
    value: JSONWriterBehaviorValue,
    outputPages: boolean,
    usePropertiesAtLanguage: boolean,
    includeSkosNotationForLinksAndControlled: boolean,
    includeOnlyElementsInPropertiesContextRequired: boolean,
    useWarningForKnownIssues: boolean,
  ) {
    super(useWarningForKnownIssues);
    this.value = value;
    this._outputPages = outputPages;
    this._usePropertiesAtLanguage = usePropertiesAtLanguage;
    this._includeSkosNotationForLinksAndControlled = includeSkosNotationForLinksAndControlled;
    this._includeOnlyElementsInPropertiesContextRequired = includeOnlyElementsInPropertiesContextRequired;
  }

  public getValue(): JSONWriterBehaviorValue {
    return this.value;
  }

  public static STRICT = new JSONWriterBehavior(JSONWriterBehaviorValues.STRICT, false, true, true, false, false);
  public static FEBRUARY_2024 = new JSONWriterBehavior(JSONWriterBehaviorValues.FEBRUARY_2024, true, false, false, true, true);

  public outputPages() {
    return this._outputPages;
  }

  usePropertiesAtLanguage() {
    return this._usePropertiesAtLanguage;
  }

  includeSkosNotationForLinksAndControlled(): boolean {
    return this._includeSkosNotationForLinksAndControlled;
  }

  includeOnlyElementsInPropertiesContextRequired() {
    return this._includeOnlyElementsInPropertiesContextRequired;
  }
}
