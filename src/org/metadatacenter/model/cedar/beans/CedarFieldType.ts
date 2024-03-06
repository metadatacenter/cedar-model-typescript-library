import { InputType } from '../constants/InputType';

export const CedarFieldTypeValues = {
  TEXT: 'DYNAMIC-text',
  CONTROLLED_TERM: 'DYNAMIC-controlled-term',
  LINK: 'DYNAMIC-link',
  TEMPORAL: 'DYNAMIC-temporal',
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

  public static TEXT = new CedarFieldType(CedarFieldTypeValues.TEXT, InputType.text);
  public static CONTROLLED_TERM = new CedarFieldType(CedarFieldTypeValues.CONTROLLED_TERM, InputType.text);
  public static LINK = new CedarFieldType(CedarFieldTypeValues.LINK, InputType.link);
  public static TEMPORAL = new CedarFieldType(CedarFieldTypeValues.TEMPORAL, InputType.temporal);
  public static STATIC_PAGE_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_PAGE_BREAK, InputType.pageBreak);
  public static STATIC_SECTION_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_SECTION_BREAK, InputType.sectionBreak);
  public static STATIC_IMAGE = new CedarFieldType(CedarFieldTypeValues.STATIC_IMAGE, InputType.image);
  public static STATIC_RICH_TEXT = new CedarFieldType(CedarFieldTypeValues.STATIC_RICH_TEXT, InputType.richText);
  public static STATIC_YOUTUBE = new CedarFieldType(CedarFieldTypeValues.STATIC_YOUTUBE, InputType.youtube);
  public static NULL = new CedarFieldType(null, null);

  toJSON() {
    return this.value;
  }
}
