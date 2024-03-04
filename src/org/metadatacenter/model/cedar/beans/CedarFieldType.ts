export const CedarFieldTypeValues = {
  TEXT: 'DYNAMIC-text',
  CONTROLLED_TERM: 'DYNAMIC-controlled-term',
  LINK: 'DYNAMIC-link',
  STATIC_TEXT: 'STATIC-text',
  STATIC_PAGE_BREAK: 'STATIC-page-break',
  STATIC_SECTION_BREAK: 'STATIC-section-break',
  STATIC_IMAGE: 'STATIC-image',
  STATIC_RICH_TEXT: 'STATIC-rich_text',
  STATIC_YOUTUBE: 'STATIC-youtube',
} as const;

export type CedarFieldTypeValue = (typeof CedarFieldTypeValues)[keyof typeof CedarFieldTypeValues] | null;

export class CedarFieldType {
  private readonly value: CedarFieldTypeValue | null;

  private constructor(value: CedarFieldTypeValue) {
    this.value = value;
  }

  public getValue(): CedarFieldTypeValue {
    return this.value;
  }

  public static TEXT = new CedarFieldType(CedarFieldTypeValues.TEXT);
  public static CONTROLLED_TERM = new CedarFieldType(CedarFieldTypeValues.CONTROLLED_TERM);
  public static LINK = new CedarFieldType(CedarFieldTypeValues.LINK);
  public static STATIC_TEXT = new CedarFieldType(CedarFieldTypeValues.STATIC_TEXT);
  public static STATIC_PAGE_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_PAGE_BREAK);
  public static STATIC_SECTION_BREAK = new CedarFieldType(CedarFieldTypeValues.STATIC_SECTION_BREAK);
  public static STATIC_IMAGE = new CedarFieldType(CedarFieldTypeValues.STATIC_IMAGE);
  public static STATIC_RICH_TEXT = new CedarFieldType(CedarFieldTypeValues.STATIC_RICH_TEXT);
  public static STATIC_YOUTUBE = new CedarFieldType(CedarFieldTypeValues.STATIC_YOUTUBE);
  public static NULL = new CedarFieldType(null);

  public static values(): CedarFieldType[] {
    return [CedarFieldType.TEXT, CedarFieldType.CONTROLLED_TERM, CedarFieldType.LINK, CedarFieldType.STATIC_TEXT];
  }

  public static forValue(value: string | null): CedarFieldType {
    for (const status of CedarFieldType.values()) {
      if (status.getValue() === value) {
        return status;
      }
    }
    return this.NULL;
  }

  toJSON() {
    return this.value;
  }
}
