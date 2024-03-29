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
}
