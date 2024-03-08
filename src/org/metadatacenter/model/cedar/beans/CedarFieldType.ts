import { UiInputTypeValue, UiInputTypeValues } from './UiInputType';

export const CedarFieldTypeValues = {
  TEXTFIELD: 'DYNAMIC-textfield',
  TEXTAREA: 'DYNAMIC-textarea',
  CONTROLLED_TERM: 'DYNAMIC-controlled-term',
  LINK: 'DYNAMIC-link',
  TEMPORAL: 'DYNAMIC-temporal',
  EMAIL: 'DYNAMIC-email',
  NUMERIC: 'DYNAMIC-numeric',
  PHONE_NUMBER: 'DYNAMIC-phone-number',
  RADIO: 'DYNAMIC-radio',
  STATIC_PAGE_BREAK: 'STATIC-page-break',
  STATIC_SECTION_BREAK: 'STATIC-section-break',
  STATIC_IMAGE: 'STATIC-image',
  STATIC_RICH_TEXT: 'STATIC-rich_text',
  STATIC_YOUTUBE: 'STATIC-youtube',
} as const;

export type CedarFieldTypeValue = (typeof CedarFieldTypeValues)[keyof typeof CedarFieldTypeValues] | null;

export class CedarFieldType {
  private readonly value: CedarFieldTypeValue | null;
  private readonly _uiInputType: UiInputTypeValue | null;

  private constructor(value: CedarFieldTypeValue, uiInputType: UiInputTypeValue | null) {
    this.value = value;
    this._uiInputType = uiInputType;
  }

  public getValue(): CedarFieldTypeValue {
    return this.value;
  }

  public getUiInputType(): UiInputTypeValue | null {
    return this._uiInputType;
  }

  public static TEXT = new CedarFieldType(CedarFieldTypeValues.TEXTFIELD, UiInputTypeValues.TEXTFIELD);
  public static TEXTAREA = new CedarFieldType(CedarFieldTypeValues.TEXTAREA, UiInputTypeValues.TEXTAREA);
  public static CONTROLLED_TERM = new CedarFieldType(CedarFieldTypeValues.CONTROLLED_TERM, UiInputTypeValues.TEXTFIELD);
  public static LINK = new CedarFieldType(CedarFieldTypeValues.LINK, UiInputTypeValues.LINK);
  public static TEMPORAL = new CedarFieldType(CedarFieldTypeValues.TEMPORAL, UiInputTypeValues.TEMPORAL);
  public static EMAIL = new CedarFieldType(CedarFieldTypeValues.EMAIL, UiInputTypeValues.EMAIL);
  public static NUMERIC = new CedarFieldType(CedarFieldTypeValues.NUMERIC, UiInputTypeValues.NUMERIC);
  public static PHONE_NUMBER = new CedarFieldType(CedarFieldTypeValues.PHONE_NUMBER, UiInputTypeValues.PHONE_NUMBER);
  public static RADIO = new CedarFieldType(CedarFieldTypeValues.RADIO, UiInputTypeValues.RADIO);
  public static STATIC_PAGE_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_PAGE_BREAK, UiInputTypeValues.PAGE_BREAK);
  public static STATIC_SECTION_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_SECTION_BREAK, UiInputTypeValues.SECTION_BREAK);
  public static STATIC_IMAGE = new CedarFieldType(CedarFieldTypeValues.STATIC_IMAGE, UiInputTypeValues.IMAGE);
  public static STATIC_RICH_TEXT = new CedarFieldType(CedarFieldTypeValues.STATIC_RICH_TEXT, UiInputTypeValues.RICH_TEXT);
  public static STATIC_YOUTUBE = new CedarFieldType(CedarFieldTypeValues.STATIC_YOUTUBE, UiInputTypeValues.YOUTUBE);
  public static NULL = new CedarFieldType(null, null);
}
