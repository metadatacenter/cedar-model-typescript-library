import { UiInputType } from './UiInputType';

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
  private readonly _uiInputType: UiInputType;

  private constructor(value: CedarFieldTypeValue, uiInputType: UiInputType) {
    this.value = value;
    this._uiInputType = uiInputType;
  }

  public getValue(): CedarFieldTypeValue {
    return this.value;
  }

  public getUiInputType(): UiInputType {
    return this._uiInputType;
  }

  public static TEXT = new CedarFieldType(CedarFieldTypeValues.TEXTFIELD, UiInputType.TEXTFIELD);
  public static TEXTAREA = new CedarFieldType(CedarFieldTypeValues.TEXTAREA, UiInputType.TEXTAREA);
  public static CONTROLLED_TERM = new CedarFieldType(CedarFieldTypeValues.CONTROLLED_TERM, UiInputType.TEXTFIELD);
  public static LINK = new CedarFieldType(CedarFieldTypeValues.LINK, UiInputType.LINK);
  public static TEMPORAL = new CedarFieldType(CedarFieldTypeValues.TEMPORAL, UiInputType.TEMPORAL);
  public static EMAIL = new CedarFieldType(CedarFieldTypeValues.EMAIL, UiInputType.EMAIL);
  public static NUMERIC = new CedarFieldType(CedarFieldTypeValues.NUMERIC, UiInputType.NUMERIC);
  public static PHONE_NUMBER = new CedarFieldType(CedarFieldTypeValues.PHONE_NUMBER, UiInputType.PHONE_NUMBER);
  public static RADIO = new CedarFieldType(CedarFieldTypeValues.RADIO, UiInputType.RADIO);
  public static STATIC_PAGE_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_PAGE_BREAK, UiInputType.PAGE_BREAK);
  public static STATIC_SECTION_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_SECTION_BREAK, UiInputType.SECTION_BREAK);
  public static STATIC_IMAGE = new CedarFieldType(CedarFieldTypeValues.STATIC_IMAGE, UiInputType.IMAGE);
  public static STATIC_RICH_TEXT = new CedarFieldType(CedarFieldTypeValues.STATIC_RICH_TEXT, UiInputType.RICH_TEXT);
  public static STATIC_YOUTUBE = new CedarFieldType(CedarFieldTypeValues.STATIC_YOUTUBE, UiInputType.YOUTUBE);
  public static NULL = new CedarFieldType(null, UiInputType.NULL);
}
