export const UiInputTypeValues = {
  TEXTFIELD: 'textfield',
  TEXTAREA: 'textarea',
  LINK: 'link',
  TEMPORAL: 'temporal',
  EMAIL: 'email',
  NUMERIC: 'numeric',
  PHONE_NUMBER: 'phone-number',
  LIST: 'list',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  ATTRIBUTE_VALUE: 'attribute-value',
  BOOLEAN: 'boolean',

  PAGE_BREAK: 'page-break',
  SECTION_BREAK: 'section-break',
  IMAGE: 'image',
  RICH_TEXT: 'richtext',
  YOUTUBE: 'youtube',
} as const;

export type UiInputTypeValue = (typeof UiInputTypeValues)[keyof typeof UiInputTypeValues] | null;

export class UiInputType {
  private readonly value: UiInputTypeValue | null;

  private constructor(value: UiInputTypeValue) {
    this.value = value;
  }

  public getValue(): UiInputTypeValue {
    return this.value;
  }

  public static TEXTFIELD = new UiInputType(UiInputTypeValues.TEXTFIELD);
  public static TEXTAREA = new UiInputType(UiInputTypeValues.TEXTAREA);
  public static LINK = new UiInputType(UiInputTypeValues.LINK);
  public static TEMPORAL = new UiInputType(UiInputTypeValues.TEMPORAL);
  public static EMAIL = new UiInputType(UiInputTypeValues.EMAIL);
  public static NUMERIC = new UiInputType(UiInputTypeValues.NUMERIC);
  public static PHONE_NUMBER = new UiInputType(UiInputTypeValues.PHONE_NUMBER);
  public static LIST = new UiInputType(UiInputTypeValues.LIST);
  public static CHECKBOX = new UiInputType(UiInputTypeValues.CHECKBOX);
  public static RADIO = new UiInputType(UiInputTypeValues.RADIO);
  public static ATTRIBUTE_VALUE = new UiInputType(UiInputTypeValues.ATTRIBUTE_VALUE);
  public static BOOLEAN = new UiInputType(UiInputTypeValues.BOOLEAN);

  public static PAGE_BREAK = new UiInputType(UiInputTypeValues.PAGE_BREAK);
  public static SECTION_BREAK = new UiInputType(UiInputTypeValues.SECTION_BREAK);
  public static IMAGE = new UiInputType(UiInputTypeValues.IMAGE);
  public static RICH_TEXT = new UiInputType(UiInputTypeValues.RICH_TEXT);
  public static YOUTUBE = new UiInputType(UiInputTypeValues.YOUTUBE);

  public static NULL = new UiInputType(null);

  public static values(): UiInputType[] {
    return [
      UiInputType.TEXTFIELD,
      UiInputType.TEXTAREA,
      UiInputType.LINK,
      UiInputType.TEMPORAL,
      UiInputType.EMAIL,
      UiInputType.NUMERIC,
      UiInputType.PHONE_NUMBER,
      UiInputType.LIST,
      UiInputType.CHECKBOX,
      UiInputType.RADIO,
      UiInputType.ATTRIBUTE_VALUE,
      UiInputType.BOOLEAN,

      UiInputType.PAGE_BREAK,
      UiInputType.SECTION_BREAK,
      UiInputType.IMAGE,
      UiInputType.RICH_TEXT,
      UiInputType.YOUTUBE,

      UiInputType.NULL,
    ];
  }

  public static forValue(value: string | null): UiInputType {
    for (const temporalType of UiInputType.values()) {
      if (temporalType.getValue() === value) {
        return temporalType;
      }
    }
    return this.NULL;
  }
}
