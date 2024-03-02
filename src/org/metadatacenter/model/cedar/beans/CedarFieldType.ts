export const CedarFieldTypeValues = {
  TEXT: 'text',
  CONTROLLED_TERM: 'controlled-term',
  LINK: 'link',
  STATIC_TEXT: 'static-text',
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
