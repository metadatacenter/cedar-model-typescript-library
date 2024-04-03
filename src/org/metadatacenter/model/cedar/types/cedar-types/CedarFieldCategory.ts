export const CedarFieldCategoryValues = {
  STATIC: 'STATIC-field',
  DYNAMIC: 'DYNAMIC-field',
  NONE: 'NONE',
} as const;

export type CedarFieldCategoryValue = (typeof CedarFieldCategoryValues)[keyof typeof CedarFieldCategoryValues] | null;

export class CedarFieldCategory {
  private readonly value: CedarFieldCategoryValue | null;

  private constructor(value: CedarFieldCategoryValue) {
    this.value = value;
  }

  public getValue(): CedarFieldCategoryValue {
    return this.value;
  }

  public static values(): CedarFieldCategory[] {
    return [CedarFieldCategory.STATIC, CedarFieldCategory.DYNAMIC, CedarFieldCategory.NONE];
  }

  public static STATIC = new CedarFieldCategory(CedarFieldCategoryValues.STATIC);
  public static DYNAMIC = new CedarFieldCategory(CedarFieldCategoryValues.DYNAMIC);
  public static NONE = new CedarFieldCategory(CedarFieldCategoryValues.NONE);
  public static NULL = new CedarFieldCategory(null);
}
