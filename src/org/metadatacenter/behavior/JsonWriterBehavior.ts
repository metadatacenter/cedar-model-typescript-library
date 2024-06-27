import { ReaderWriterBehavior } from './ReaderWriterBehavior';

export const JsonWriterBehaviorValues = {
  STRICT: 'strict',
  FEBRUARY_2024: 'february-2024',
} as const;

export type JsonWriterBehaviorValue = (typeof JsonWriterBehaviorValues)[keyof typeof JsonWriterBehaviorValues] | null;

export class JsonWriterBehavior extends ReaderWriterBehavior {
  private readonly value: JsonWriterBehaviorValue | null;
  private readonly _outputPages: boolean;
  private readonly _usePropertiesAtLanguage: boolean;
  private readonly _includeSkosNotationForLinksAndControlled: boolean;

  private constructor(
    value: JsonWriterBehaviorValue,
    outputPages: boolean,
    usePropertiesAtLanguage: boolean,
    includeSkosNotationForLinksAndControlled: boolean,
    useWarningForKnownIssues: boolean,
  ) {
    super(useWarningForKnownIssues);
    this.value = value;
    this._outputPages = outputPages;
    this._usePropertiesAtLanguage = usePropertiesAtLanguage;
    this._includeSkosNotationForLinksAndControlled = includeSkosNotationForLinksAndControlled;
  }

  public getValue(): JsonWriterBehaviorValue {
    return this.value;
  }

  public static STRICT = new JsonWriterBehavior(JsonWriterBehaviorValues.STRICT, false, true, true, false);
  public static FEBRUARY_2024 = new JsonWriterBehavior(JsonWriterBehaviorValues.FEBRUARY_2024, true, false, false, true);

  public outputPages() {
    return this._outputPages;
  }

  usePropertiesAtLanguage() {
    return this._usePropertiesAtLanguage;
  }

  includeSkosNotationForLinksAndControlled(): boolean {
    return this._includeSkosNotationForLinksAndControlled;
  }
}
