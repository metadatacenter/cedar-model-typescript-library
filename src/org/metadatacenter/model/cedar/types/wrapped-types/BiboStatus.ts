import { TextPolicy } from '../../../../policy/TextPolicy';

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

  /**
   * The status a JSON document's `bibo:status` names. Java's reader matches the spelling to a constant
   * ignoring case, so `bibo:Draft` is a draft, and refuses any other. A spelling that `forJsonValue`
   * did not know was read as no status, and the writers then left the key out. A document that states
   * no status has none, as in Java.
   */
  public static forJsonStatus(value: unknown): BiboStatus {
    if (value === null || value === undefined) {
      return BiboStatus.NULL;
    }
    const match = BiboStatus.values().find((status) => {
      const constant = status.getJsonValue();
      return typeof value === 'string' && constant !== null && TextPolicy.equalsIgnoreCase(constant, value);
    });
    if (match === undefined) {
      throw new Error(`No status constant with text ${typeof value === 'string' ? value : JSON.stringify(value)} found`);
    }
    return match;
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
