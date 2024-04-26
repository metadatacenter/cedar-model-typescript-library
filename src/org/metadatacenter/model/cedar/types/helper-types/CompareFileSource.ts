export const CompareFileSourceValues = {
  TS_LIB: 'TypeScriptLib',
  JAVA_LIB: 'JavaLib',
  REF: 'reference',
} as const;

export type CompareFileSourceValue = (typeof CompareFileSourceValues)[keyof typeof CompareFileSourceValues] | null;

export class CompareFileSource {
  private readonly value: CompareFileSourceValue | null;

  private constructor(value: CompareFileSourceValue) {
    this.value = value;
  }

  public getValue(): CompareFileSourceValue {
    return this.value;
  }

  public static TS_LIB = new CompareFileSource(CompareFileSourceValues.TS_LIB);
  public static JAVA_LIB = new CompareFileSource(CompareFileSourceValues.JAVA_LIB);
  public static REF = new CompareFileSource(CompareFileSourceValues.REF);
}
