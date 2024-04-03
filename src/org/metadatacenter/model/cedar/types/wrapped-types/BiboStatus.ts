export const BiboStatusJsonValues = {
  DRAFT: 'bibo:draft',
  PUBLISHED: 'bibo:published',
} as const;

export const BiboStatusYamlValues = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type BiboStatusJsonValue = (typeof BiboStatusJsonValues)[keyof typeof BiboStatusJsonValues] | null;
export type BiboStatusYamlValue = (typeof BiboStatusYamlValues)[keyof typeof BiboStatusYamlValues] | null;

export class BiboStatus {
  private readonly jsonValue: BiboStatusJsonValue | null;
  private readonly yamlValue: BiboStatusYamlValue | null;

  private constructor(jsonValue: BiboStatusJsonValue, yamlValue: BiboStatusYamlValue) {
    this.jsonValue = jsonValue;
    this.yamlValue = yamlValue;
  }

  public getJsonValue(): BiboStatusJsonValue {
    return this.jsonValue;
  }

  getYamlValue(): BiboStatusYamlValue {
    return this.yamlValue;
  }

  public static DRAFT = new BiboStatus(BiboStatusJsonValues.DRAFT, BiboStatusYamlValues.DRAFT);
  public static PUBLISHED = new BiboStatus(BiboStatusJsonValues.PUBLISHED, BiboStatusYamlValues.PUBLISHED);
  public static NULL = new BiboStatus(null, null);

  public static values(): BiboStatus[] {
    return [BiboStatus.DRAFT, BiboStatus.PUBLISHED];
  }

  public static forJsonValue(value: string | null): BiboStatus {
    for (const status of BiboStatus.values()) {
      if (status.getJsonValue() === value) {
        return status;
      }
    }
    return this.NULL;
  }

  public static forYamlValue(value: string | null): BiboStatus {
    for (const status of BiboStatus.values()) {
      if (status.getYamlValue() === value) {
        return status;
      }
    }
    return this.NULL;
  }
}
