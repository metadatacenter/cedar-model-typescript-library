import { InputType } from '../constants/InputType';

export const CedarFieldTypeValues = {
  TEXTFIELD: 'DYNAMIC-textfield',
  TEXTAREA: 'DYNAMIC-textarea',
  CONTROLLED_TERM: 'DYNAMIC-controlled-term',
  LINK: 'DYNAMIC-link',
  TEMPORAL: 'DYNAMIC-temporal',
  EMAIL: 'DYNAMIC-email',
  NUMERIC: 'DYNAMIC-numeric',
  PHONE_NUMBER: 'DYNAMIC-phone-number',
  STATIC_PAGE_BREAK: 'STATIC-page-break',
  STATIC_SECTION_BREAK: 'STATIC-section-break',
  STATIC_IMAGE: 'STATIC-image',
  STATIC_RICH_TEXT: 'STATIC-rich_text',
  STATIC_YOUTUBE: 'STATIC-youtube',
} as const;

export type CedarFieldTypeValue = (typeof CedarFieldTypeValues)[keyof typeof CedarFieldTypeValues] | null;

export class CedarFieldType {
  private readonly value: CedarFieldTypeValue | null;
  private readonly _uiInputType: string | null;

  private constructor(value: CedarFieldTypeValue, uiInputType: string | null) {
    this.value = value;
    this._uiInputType = uiInputType;
  }

  public getValue(): CedarFieldTypeValue {
    return this.value;
  }

  public getUiInputType(): string | null {
    return this._uiInputType;
  }

  public static TEXT = new CedarFieldType(CedarFieldTypeValues.TEXTFIELD, InputType.textfield);
  public static TEXTAREA = new CedarFieldType(CedarFieldTypeValues.TEXTAREA, InputType.textarea);
  public static CONTROLLED_TERM = new CedarFieldType(CedarFieldTypeValues.CONTROLLED_TERM, InputType.textfield);
  public static LINK = new CedarFieldType(CedarFieldTypeValues.LINK, InputType.link);
  public static TEMPORAL = new CedarFieldType(CedarFieldTypeValues.TEMPORAL, InputType.temporal);
  public static EMAIL = new CedarFieldType(CedarFieldTypeValues.EMAIL, InputType.email);
  public static NUMERIC = new CedarFieldType(CedarFieldTypeValues.NUMERIC, InputType.numeric);
  public static PHONE_NUMBER = new CedarFieldType(CedarFieldTypeValues.PHONE_NUMBER, InputType.phoneNumber);
  public static STATIC_PAGE_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_PAGE_BREAK, InputType.pageBreak);
  public static STATIC_SECTION_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_SECTION_BREAK, InputType.sectionBreak);
  public static STATIC_IMAGE = new CedarFieldType(CedarFieldTypeValues.STATIC_IMAGE, InputType.image);
  public static STATIC_RICH_TEXT = new CedarFieldType(CedarFieldTypeValues.STATIC_RICH_TEXT, InputType.richText);
  public static STATIC_YOUTUBE = new CedarFieldType(CedarFieldTypeValues.STATIC_YOUTUBE, InputType.youtube);
  public static NULL = new CedarFieldType(null, null);
}
