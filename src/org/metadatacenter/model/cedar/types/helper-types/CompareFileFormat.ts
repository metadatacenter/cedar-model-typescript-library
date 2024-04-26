export const CompareFileFormatValues = {
  YAML: 'yaml',
  JSON: 'json',
} as const;

export type CompareFileFormatValue = (typeof CompareFileFormatValues)[keyof typeof CompareFileFormatValues] | null;

export class CompareFileFormat {
  private readonly value: CompareFileFormatValue | null;

  private constructor(value: CompareFileFormatValue) {
    this.value = value;
  }

  public getValue(): CompareFileFormatValue {
    return this.value;
  }

  public static YAML = new CompareFileFormat(CompareFileFormatValues.YAML);
  public static JSON = new CompareFileFormat(CompareFileFormatValues.JSON);
}
