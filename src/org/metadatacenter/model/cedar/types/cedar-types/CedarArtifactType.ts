import { YamlArtifactType } from '../wrapped-types/YamlArtifactType';

export const CedarArtifactTypeValues = {
  TEMPLATE: 'https://schema.metadatacenter.org/core/Template',
  TEMPLATE_ELEMENT: 'https://schema.metadatacenter.org/core/TemplateElement',
  TEMPLATE_FIELD: 'https://schema.metadatacenter.org/core/TemplateField',
  STATIC_TEMPLATE_FIELD: 'https://schema.metadatacenter.org/core/StaticTemplateField',
} as const;

export const CedarArtifactTypeYamlValues = {
  TEMPLATE: 'template',
  TEMPLATE_ELEMENT: 'templateElement',
  TEMPLATE_FIELD: 'templateField',
  STATIC_TEMPLATE_FIELD: 'staticTemplateField',
} as const;

export type CedarArtifactTypeValue = (typeof CedarArtifactTypeValues)[keyof typeof CedarArtifactTypeValues] | null;
export type CedarArtifactTypeYamlValue = (typeof CedarArtifactTypeYamlValues)[keyof typeof CedarArtifactTypeYamlValues] | null;

export class CedarArtifactType {
  private readonly value: CedarArtifactTypeValue | null;
  private readonly yamlValue: CedarArtifactTypeYamlValue | null;

  private constructor(value: CedarArtifactTypeValue, yamlValue: CedarArtifactTypeYamlValue) {
    this.value = value;
    this.yamlValue = yamlValue;
  }

  public getValue(): CedarArtifactTypeValue {
    return this.value;
  }

  getYamlValue() {
    return this.yamlValue;
  }

  public static TEMPLATE = new CedarArtifactType(CedarArtifactTypeValues.TEMPLATE, CedarArtifactTypeYamlValues.TEMPLATE);
  public static TEMPLATE_ELEMENT = new CedarArtifactType(
    CedarArtifactTypeValues.TEMPLATE_ELEMENT,
    CedarArtifactTypeYamlValues.TEMPLATE_ELEMENT,
  );
  public static TEMPLATE_FIELD = new CedarArtifactType(CedarArtifactTypeValues.TEMPLATE_FIELD, CedarArtifactTypeYamlValues.TEMPLATE_FIELD);
  public static STATIC_TEMPLATE_FIELD = new CedarArtifactType(
    CedarArtifactTypeValues.STATIC_TEMPLATE_FIELD,
    CedarArtifactTypeYamlValues.STATIC_TEMPLATE_FIELD,
  );
  public static NULL = new CedarArtifactType(null, null);

  public static values(): CedarArtifactType[] {
    return [
      CedarArtifactType.TEMPLATE,
      CedarArtifactType.TEMPLATE_ELEMENT,
      CedarArtifactType.TEMPLATE_FIELD,
      CedarArtifactType.STATIC_TEMPLATE_FIELD,
    ];
  }

  public static forValue(value: string | null): CedarArtifactType {
    for (const artifactType of CedarArtifactType.values()) {
      if (artifactType.getValue() === value) {
        return artifactType;
      }
    }
    return this.NULL;
  }

  static forYamlArtifactType(yamlArtifactType: YamlArtifactType): CedarArtifactType {
    if (yamlArtifactType.isTemplate()) {
      return CedarArtifactType.TEMPLATE;
    } else if (yamlArtifactType.isElement()) {
      return CedarArtifactType.TEMPLATE_ELEMENT;
    } else if (yamlArtifactType.isDynamicField()) {
      return CedarArtifactType.TEMPLATE_FIELD;
    } else if (yamlArtifactType.isStaticField()) {
      return CedarArtifactType.STATIC_TEMPLATE_FIELD;
    }
    return CedarArtifactType.NULL;
  }
}
