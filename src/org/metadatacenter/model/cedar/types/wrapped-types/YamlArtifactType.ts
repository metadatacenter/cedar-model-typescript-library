export const YamlArtifactTypeValues = {
  TEMPLATE: 'template',

  ELEMENT: 'element',

  TEXTFIELD: 'text-field',
  CONTROLLED_TERM: 'controlled-term-field',
  TEXTAREA: 'text-area-field',
  LINK: 'link-field',
  TEMPORAL: 'temporal-field',
  EMAIL: 'email-field',
  NUMERIC: 'numeric-field',
  PHONE_NUMBER: 'phone-number-field',
  SINGLE_SELECT_LIST: 'single-select-list-field',
  MULTI_SELECT_LIST: 'multi-select-list-field',
  CHECKBOX: 'checkbox-field',
  RADIO: 'radio-field',
  ATTRIBUTE_VALUE: 'attribute-value-field',

  PAGE_BREAK: 'static-page-break',
  SECTION_BREAK: 'static-section-break',
  IMAGE: 'static-image',
  RICH_TEXT: 'static-rich-text',
  YOUTUBE: 'static-youtube-video',
} as const;

export type YamlArtifactTypeValue = (typeof YamlArtifactTypeValues)[keyof typeof YamlArtifactTypeValues] | null;

export class YamlArtifactType {
  private readonly value: YamlArtifactTypeValue | null;

  private constructor(value: YamlArtifactTypeValue) {
    this.value = value;
  }

  public getValue(): YamlArtifactTypeValue {
    return this.value;
  }

  public static TEMPLATE = new YamlArtifactType(YamlArtifactTypeValues.TEMPLATE);
  public static ELEMENT = new YamlArtifactType(YamlArtifactTypeValues.ELEMENT);

  public static TEXTFIELD = new YamlArtifactType(YamlArtifactTypeValues.TEXTFIELD);
  public static CONTROLLED_TERM = new YamlArtifactType(YamlArtifactTypeValues.CONTROLLED_TERM);
  public static TEXTAREA = new YamlArtifactType(YamlArtifactTypeValues.TEXTAREA);
  public static LINK = new YamlArtifactType(YamlArtifactTypeValues.LINK);
  public static TEMPORAL = new YamlArtifactType(YamlArtifactTypeValues.TEMPORAL);
  public static EMAIL = new YamlArtifactType(YamlArtifactTypeValues.EMAIL);
  public static NUMERIC = new YamlArtifactType(YamlArtifactTypeValues.NUMERIC);
  public static PHONE_NUMBER = new YamlArtifactType(YamlArtifactTypeValues.PHONE_NUMBER);
  public static SINGLE_SELECT_LIST = new YamlArtifactType(YamlArtifactTypeValues.SINGLE_SELECT_LIST);
  public static MULTI_SELECT_LIST = new YamlArtifactType(YamlArtifactTypeValues.MULTI_SELECT_LIST);
  public static CHECKBOX = new YamlArtifactType(YamlArtifactTypeValues.CHECKBOX);
  public static RADIO = new YamlArtifactType(YamlArtifactTypeValues.RADIO);
  public static ATTRIBUTE_VALUE = new YamlArtifactType(YamlArtifactTypeValues.ATTRIBUTE_VALUE);

  public static PAGE_BREAK = new YamlArtifactType(YamlArtifactTypeValues.PAGE_BREAK);
  public static SECTION_BREAK = new YamlArtifactType(YamlArtifactTypeValues.SECTION_BREAK);
  public static IMAGE = new YamlArtifactType(YamlArtifactTypeValues.IMAGE);
  public static RICH_TEXT = new YamlArtifactType(YamlArtifactTypeValues.RICH_TEXT);
  public static YOUTUBE = new YamlArtifactType(YamlArtifactTypeValues.YOUTUBE);

  public static NULL = new YamlArtifactType(null);

  public static values(): YamlArtifactType[] {
    return [
      YamlArtifactType.TEMPLATE,
      YamlArtifactType.ELEMENT,

      YamlArtifactType.TEXTFIELD,
      YamlArtifactType.CONTROLLED_TERM,
      YamlArtifactType.TEXTAREA,
      YamlArtifactType.LINK,
      YamlArtifactType.TEMPORAL,
      YamlArtifactType.EMAIL,
      YamlArtifactType.NUMERIC,
      YamlArtifactType.PHONE_NUMBER,
      YamlArtifactType.SINGLE_SELECT_LIST,
      YamlArtifactType.MULTI_SELECT_LIST,
      YamlArtifactType.CHECKBOX,
      YamlArtifactType.RADIO,
      YamlArtifactType.ATTRIBUTE_VALUE,

      YamlArtifactType.PAGE_BREAK,
      YamlArtifactType.SECTION_BREAK,
      YamlArtifactType.IMAGE,
      YamlArtifactType.RICH_TEXT,
      YamlArtifactType.YOUTUBE,

      YamlArtifactType.NULL,
    ];
  }

  public static forValue(value: string | null): YamlArtifactType {
    for (const temporalType of YamlArtifactType.values()) {
      if (temporalType.getValue() === value) {
        return temporalType;
      }
    }
    return this.NULL;
  }
}
