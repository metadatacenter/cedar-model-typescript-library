export const CedarArtifactTypeValues = {
  TEMPLATE: 'https://schema.metadatacenter.org/core/Template',
  TEMPLATE_ELEMENT: 'https://schema.metadatacenter.org/core/TemplateElement',
  TEMPLATE_FIELD: 'https://schema.metadatacenter.org/core/TemplateField',
  STATIC_TEMPLATE_FIELD: 'https://schema.metadatacenter.org/core/StaticTemplateField',
} as const;

export type CedarArtifactTypeValue = (typeof CedarArtifactTypeValues)[keyof typeof CedarArtifactTypeValues] | null;

export class CedarArtifactType {
  private readonly value: CedarArtifactTypeValue | null;

  private constructor(value: CedarArtifactTypeValue) {
    this.value = value;
  }

  public getValue(): CedarArtifactTypeValue {
    return this.value;
  }

  public static TEMPLATE = new CedarArtifactType(CedarArtifactTypeValues.TEMPLATE);
  public static TEMPLATE_ELEMENT = new CedarArtifactType(CedarArtifactTypeValues.TEMPLATE_ELEMENT);
  public static TEMPLATE_FIELD = new CedarArtifactType(CedarArtifactTypeValues.TEMPLATE_FIELD);
  public static STATIC_TEMPLATE_FIELD = new CedarArtifactType(CedarArtifactTypeValues.STATIC_TEMPLATE_FIELD);
  public static UNKNOWN = new CedarArtifactType(null);

  public static values(): CedarArtifactType[] {
    return [
      CedarArtifactType.TEMPLATE,
      CedarArtifactType.TEMPLATE_ELEMENT,
      CedarArtifactType.TEMPLATE_FIELD,
      CedarArtifactType.STATIC_TEMPLATE_FIELD,
    ];
  }

  public static forValue(value: string | null): CedarArtifactType {
    for (const status of CedarArtifactType.values()) {
      if (status.getValue() === value) {
        return status;
      }
    }
    return this.UNKNOWN;
  }

  toJSON() {
    return this.value;
  }
}
