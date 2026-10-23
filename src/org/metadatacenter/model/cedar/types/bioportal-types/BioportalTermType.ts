import { TextPolicy } from '../../../../policy/TextPolicy';

export const BioportalTermTypeJsonValues = {
  ONTOLOGY_CLASS: 'OntologyClass',
  VALUE: 'Value',
} as const;

export const BioportalTermTypeYamlValues = {
  ONTOLOGY_CLASS: 'class',
  VALUE: 'value',
} as const;

export type BioportalTermTypeJsonValue = (typeof BioportalTermTypeJsonValues)[keyof typeof BioportalTermTypeJsonValues] | null;
export type BioportalTermTypeYamlValue = (typeof BioportalTermTypeYamlValues)[keyof typeof BioportalTermTypeYamlValues] | null;

export class BioportalTermType {
  private readonly jsonValue: BioportalTermTypeJsonValue | null;
  private readonly yamlValue: BioportalTermTypeYamlValue | null;

  private constructor(jsonValue: BioportalTermTypeJsonValue, yamlValue: BioportalTermTypeYamlValue) {
    this.jsonValue = jsonValue;
    this.yamlValue = yamlValue;
  }

  public getJsonValue(): BioportalTermTypeJsonValue {
    return this.jsonValue;
  }

  getYamlValue(): BioportalTermTypeYamlValue {
    return this.yamlValue;
  }

  public static ONTOLOGY_CLASS = new BioportalTermType(
    BioportalTermTypeJsonValues.ONTOLOGY_CLASS,
    BioportalTermTypeYamlValues.ONTOLOGY_CLASS,
  );
  public static VALUE = new BioportalTermType(BioportalTermTypeJsonValues.VALUE, BioportalTermTypeYamlValues.VALUE);
  public static NULL = new BioportalTermType(null, null);

  public static values(): BioportalTermType[] {
    return [BioportalTermType.ONTOLOGY_CLASS, BioportalTermType.VALUE];
  }

  public static forJsonValue(value: string | null): BioportalTermType {
    for (const termType of BioportalTermType.values()) {
      if (termType.getJsonValue() === value) {
        return termType;
      }
    }
    return this.NULL;
  }

  /**
   * The term type a JSON constraint's `type` names. Java's reader matches the spelling to a constant
   * ignoring case, so `ontologyclass` is an ontology class, and refuses any other, and a constraint
   * that states none. A spelling that `forJsonValue` did not know was read as no type, and the writers
   * then wrote `"type": null`.
   */
  public static forJsonType(value: unknown, constraint: string): BioportalTermType {
    if (value === null || value === undefined) {
      throw new Error(`${constraint} requires a term type.`);
    }
    const match = BioportalTermType.values().find((termType) => {
      const constant = termType.getJsonValue();
      return typeof value === 'string' && constant !== null && TextPolicy.equalsIgnoreCase(constant, value);
    });
    if (match === undefined) {
      throw new Error(`No value type constant with name ${typeof value === 'string' ? value : JSON.stringify(value)} found`);
    }
    return match;
  }

  public static forYamlValue(value: string | null): BioportalTermType {
    for (const termType of BioportalTermType.values()) {
      if (termType.getYamlValue() === value) {
        return termType;
      }
    }
    return this.NULL;
  }
}
