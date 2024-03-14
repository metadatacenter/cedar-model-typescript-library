export const AdditionalPropertiesValues = {
  FALSE: 'false',
  ALLOW_ATTRIBUTE_VALUE: 'allow-attribute-value',
} as const;

export type AdditionalPropertiesValue = (typeof AdditionalPropertiesValues)[keyof typeof AdditionalPropertiesValues] | null;

export class AdditionalProperties {
  private readonly value: AdditionalPropertiesValue | null;

  private constructor(value: AdditionalPropertiesValue) {
    this.value = value;
  }

  public getValue(): AdditionalPropertiesValue {
    return this.value;
  }

  public static FALSE = new AdditionalProperties(AdditionalPropertiesValues.FALSE);
  public static ALLOW_ATTRIBUTE_VALUE = new AdditionalProperties(AdditionalPropertiesValues.ALLOW_ATTRIBUTE_VALUE);
  public static NULL = new AdditionalProperties(null);

  public static values(): AdditionalProperties[] {
    return [AdditionalProperties.FALSE, AdditionalProperties.ALLOW_ATTRIBUTE_VALUE];
  }

  public static forValue(value: string | null): AdditionalProperties {
    for (const status of AdditionalProperties.values()) {
      if (status.getValue() === value) {
        return status;
      }
    }
    return this.NULL;
  }
}
