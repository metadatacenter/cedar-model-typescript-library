export interface SchemaError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: { additionalProperty?: string; missingProperty?: string };
  message?: string;
}
export interface SchemaCheck {
  (value: unknown): boolean;
  errors?: SchemaError[] | null;
}
export const template: SchemaCheck;
export const element: SchemaCheck;
export const literal: SchemaCheck;
export const iri: SchemaCheck;
export const staticField: SchemaCheck;
export const multiple: SchemaCheck;
export const attributeField: SchemaCheck;
export const multipleChild: SchemaCheck;
export const schemaDigests: Readonly<Record<string, string>>;
