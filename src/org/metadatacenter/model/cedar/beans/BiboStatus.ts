export const BiboStatusValues = {
  DRAFT: 'bibo:draft',
  PUBLISHED: 'bibo:published',
} as const;

export type BiboStatusValue = (typeof BiboStatusValues)[keyof typeof BiboStatusValues] | null;

export class BiboStatus {
  private readonly value: BiboStatusValue | null;

  private constructor(value: BiboStatusValue) {
    this.value = value;
  }

  public getValue(): BiboStatusValue {
    return this.value;
  }

  public static DRAFT = new BiboStatus(BiboStatusValues.DRAFT);
  public static PUBLISHED = new BiboStatus(BiboStatusValues.PUBLISHED);
  public static NULL = new BiboStatus(null);

  public static values(): BiboStatus[] {
    return [BiboStatus.DRAFT, BiboStatus.PUBLISHED];
  }

  public static forValue(value: string | null): BiboStatus {
    for (const status of BiboStatus.values()) {
      if (status.getValue() === value) {
        return status;
      }
    }
    return this.NULL;
  }
}
