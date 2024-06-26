export const JavascriptTypeValues = {
  ARRAY: 'array',
  OBJECT: 'object',
  STRING: 'string',
} as const;

export type JavascriptTypeValue = (typeof JavascriptTypeValues)[keyof typeof JavascriptTypeValues] | null;

export class JavascriptType {
  private readonly value: JavascriptTypeValue | null;

  private constructor(value: JavascriptTypeValue) {
    this.value = value;
  }

  public getValue(): JavascriptTypeValue {
    return this.value;
  }

  public static ARRAY = new JavascriptType(JavascriptTypeValues.ARRAY);
  public static OBJECT = new JavascriptType(JavascriptTypeValues.OBJECT);
  public static STRING = new JavascriptType(JavascriptTypeValues.STRING);
  public static NULL = new JavascriptType(null);

  public static values(): JavascriptType[] {
    return [JavascriptType.ARRAY, JavascriptType.OBJECT, JavascriptType.STRING];
  }

  public static forValue(value: string | null): JavascriptType {
    for (const javascriptType of JavascriptType.values()) {
      if (javascriptType.getValue() === value) {
        return javascriptType;
      }
    }
    return this.NULL;
  }
}
