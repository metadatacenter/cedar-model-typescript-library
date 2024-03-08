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
  CHECKBOX: 'DYNAMIC-checkbox',
  LIST: 'DYNAMIC-list',

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
  private readonly staticField;

  private constructor(value: CedarFieldTypeValue, uiInputType: UiInputType, staticField: boolean) {
    this.value = value;
    this._uiInputType = uiInputType;
    this.staticField = staticField;
  }

  public getValue(): CedarFieldTypeValue {
    return this.value;
  }

  public getUiInputType(): UiInputType {
    return this._uiInputType;
  }

  get isStaticField() {
    return this.staticField;
  }

  public static TEXT = new CedarFieldType(CedarFieldTypeValues.TEXTFIELD, UiInputType.TEXTFIELD, false);
  public static TEXTAREA = new CedarFieldType(CedarFieldTypeValues.TEXTAREA, UiInputType.TEXTAREA, false);
  public static CONTROLLED_TERM = new CedarFieldType(CedarFieldTypeValues.CONTROLLED_TERM, UiInputType.TEXTFIELD, false);
  public static LINK = new CedarFieldType(CedarFieldTypeValues.LINK, UiInputType.LINK, false);
  public static TEMPORAL = new CedarFieldType(CedarFieldTypeValues.TEMPORAL, UiInputType.TEMPORAL, false);
  public static EMAIL = new CedarFieldType(CedarFieldTypeValues.EMAIL, UiInputType.EMAIL, false);
  public static NUMERIC = new CedarFieldType(CedarFieldTypeValues.NUMERIC, UiInputType.NUMERIC, false);
  public static PHONE_NUMBER = new CedarFieldType(CedarFieldTypeValues.PHONE_NUMBER, UiInputType.PHONE_NUMBER, false);
  public static RADIO = new CedarFieldType(CedarFieldTypeValues.RADIO, UiInputType.RADIO, false);
  public static CHECKBOX = new CedarFieldType(CedarFieldTypeValues.CHECKBOX, UiInputType.CHECKBOX, false);
  public static LIST = new CedarFieldType(CedarFieldTypeValues.LIST, UiInputType.LIST, false);

  public static STATIC_PAGE_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_PAGE_BREAK, UiInputType.PAGE_BREAK, true);
  public static STATIC_SECTION_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_SECTION_BREAK, UiInputType.SECTION_BREAK, true);
  public static STATIC_IMAGE = new CedarFieldType(CedarFieldTypeValues.STATIC_IMAGE, UiInputType.IMAGE, true);
  public static STATIC_RICH_TEXT = new CedarFieldType(CedarFieldTypeValues.STATIC_RICH_TEXT, UiInputType.RICH_TEXT, true);
  public static STATIC_YOUTUBE = new CedarFieldType(CedarFieldTypeValues.STATIC_YOUTUBE, UiInputType.YOUTUBE, true);

  public static NULL = new CedarFieldType(null, UiInputType.NULL, true);
}
