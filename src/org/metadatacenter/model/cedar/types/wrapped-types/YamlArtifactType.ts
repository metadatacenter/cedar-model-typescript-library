import { CedarFieldCategory } from '../cedar-types/CedarFieldCategory';

export const YamlArtifactTypeValues = {
  TEMPLATE: 'template',

  ELEMENT: 'element',

  TEXTFIELD: 'text-field',
  CONTROLLED_TERM: 'controlled-term-field',
  TEXTAREA: 'text-area-field',
  LINK: 'link-field',
  TEMPORAL: 'temporal-field',
  EMAIL: 'email-field',
  NUMERIC: 'numeric-field',
  PHONE_NUMBER: 'phone-number-field',
  SINGLE_SELECT_LIST: 'single-select-list-field',
  MULTI_SELECT_LIST: 'multi-select-list-field',
  CHECKBOX: 'checkbox-field',
  RADIO: 'radio-field',
  ATTRIBUTE_VALUE: 'attribute-value-field',

  PAGE_BREAK: 'static-page-break',
  SECTION_BREAK: 'static-section-break',
  IMAGE: 'static-image',
  RICH_TEXT: 'static-rich-text',
  YOUTUBE: 'static-youtube-video',

  TEMPLATE_INSTANCE: 'instance',
} as const;

export type YamlArtifactTypeValue = (typeof YamlArtifactTypeValues)[keyof typeof YamlArtifactTypeValues] | null;

export class YamlArtifactType {
  private readonly value: YamlArtifactTypeValue | null;
  private readonly category: CedarFieldCategory;

  private constructor(value: YamlArtifactTypeValue, category: CedarFieldCategory) {
    this.value = value;
    this.category = category;
  }

  public getValue(): YamlArtifactTypeValue {
    return this.value;
  }

  public static TEMPLATE = new YamlArtifactType(YamlArtifactTypeValues.TEMPLATE, CedarFieldCategory.NONE);
  public static ELEMENT = new YamlArtifactType(YamlArtifactTypeValues.ELEMENT, CedarFieldCategory.NONE);

  public static TEXTFIELD = new YamlArtifactType(YamlArtifactTypeValues.TEXTFIELD, CedarFieldCategory.DYNAMIC);
  public static CONTROLLED_TERM = new YamlArtifactType(YamlArtifactTypeValues.CONTROLLED_TERM, CedarFieldCategory.DYNAMIC);
  public static TEXTAREA = new YamlArtifactType(YamlArtifactTypeValues.TEXTAREA, CedarFieldCategory.DYNAMIC);
  public static LINK = new YamlArtifactType(YamlArtifactTypeValues.LINK, CedarFieldCategory.DYNAMIC);
  public static TEMPORAL = new YamlArtifactType(YamlArtifactTypeValues.TEMPORAL, CedarFieldCategory.DYNAMIC);
  public static EMAIL = new YamlArtifactType(YamlArtifactTypeValues.EMAIL, CedarFieldCategory.DYNAMIC);
  public static NUMERIC = new YamlArtifactType(YamlArtifactTypeValues.NUMERIC, CedarFieldCategory.DYNAMIC);
  public static PHONE_NUMBER = new YamlArtifactType(YamlArtifactTypeValues.PHONE_NUMBER, CedarFieldCategory.DYNAMIC);
  public static SINGLE_SELECT_LIST = new YamlArtifactType(YamlArtifactTypeValues.SINGLE_SELECT_LIST, CedarFieldCategory.DYNAMIC);
  public static MULTI_SELECT_LIST = new YamlArtifactType(YamlArtifactTypeValues.MULTI_SELECT_LIST, CedarFieldCategory.DYNAMIC);
  public static CHECKBOX = new YamlArtifactType(YamlArtifactTypeValues.CHECKBOX, CedarFieldCategory.DYNAMIC);
  public static RADIO = new YamlArtifactType(YamlArtifactTypeValues.RADIO, CedarFieldCategory.DYNAMIC);
  public static ATTRIBUTE_VALUE = new YamlArtifactType(YamlArtifactTypeValues.ATTRIBUTE_VALUE, CedarFieldCategory.DYNAMIC);

  public static PAGE_BREAK = new YamlArtifactType(YamlArtifactTypeValues.PAGE_BREAK, CedarFieldCategory.STATIC);
  public static SECTION_BREAK = new YamlArtifactType(YamlArtifactTypeValues.SECTION_BREAK, CedarFieldCategory.STATIC);
  public static IMAGE = new YamlArtifactType(YamlArtifactTypeValues.IMAGE, CedarFieldCategory.STATIC);
  public static RICH_TEXT = new YamlArtifactType(YamlArtifactTypeValues.RICH_TEXT, CedarFieldCategory.STATIC);
  public static YOUTUBE = new YamlArtifactType(YamlArtifactTypeValues.YOUTUBE, CedarFieldCategory.STATIC);

  public static TEMPLATE_INSTANCE = new YamlArtifactType(YamlArtifactTypeValues.TEMPLATE_INSTANCE, CedarFieldCategory.NONE);

  public static NULL = new YamlArtifactType(null, CedarFieldCategory.NULL);

  public static values(): YamlArtifactType[] {
    return [
      YamlArtifactType.TEMPLATE,
      YamlArtifactType.ELEMENT,

      YamlArtifactType.TEXTFIELD,
      YamlArtifactType.CONTROLLED_TERM,
      YamlArtifactType.TEXTAREA,
      YamlArtifactType.LINK,
      YamlArtifactType.TEMPORAL,
      YamlArtifactType.EMAIL,
      YamlArtifactType.NUMERIC,
      YamlArtifactType.PHONE_NUMBER,
      YamlArtifactType.SINGLE_SELECT_LIST,
      YamlArtifactType.MULTI_SELECT_LIST,
      YamlArtifactType.CHECKBOX,
      YamlArtifactType.RADIO,
      YamlArtifactType.ATTRIBUTE_VALUE,

      YamlArtifactType.PAGE_BREAK,
      YamlArtifactType.SECTION_BREAK,
      YamlArtifactType.IMAGE,
      YamlArtifactType.RICH_TEXT,
      YamlArtifactType.YOUTUBE,

      YamlArtifactType.TEMPLATE_INSTANCE,

      YamlArtifactType.NULL,
    ];
  }

  public static forValue(value: string | null): YamlArtifactType {
    for (const temporalType of YamlArtifactType.values()) {
      if (temporalType.getValue() === value) {
        return temporalType;
      }
    }
    return this.NULL;
  }

  isTemplate(): boolean {
    return this.value === YamlArtifactTypeValues.TEMPLATE;
  }

  isElement(): boolean {
    return this.value === YamlArtifactTypeValues.ELEMENT;
  }

  public isField() {
    return this.isDynamicField() || this.isStaticField();
  }

  isStaticField() {
    return this.category === CedarFieldCategory.STATIC;
  }

  isDynamicField() {
    return this.category === CedarFieldCategory.DYNAMIC;
  }

  isTemplateInstance() {
    return this.value === YamlArtifactTypeValues.TEMPLATE_INSTANCE;
  }
}
