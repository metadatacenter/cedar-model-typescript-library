import { UiInputType } from '../wrapped-types/UiInputType';
import { YamlArtifactType } from '../wrapped-types/YamlArtifactType';

export const CedarFieldTypeValues = {
  TEXTFIELD: 'DYNAMIC-textfield',
  TEXTAREA: 'DYNAMIC-textarea',
  CONTROLLED_TERM: 'DYNAMIC-controlled-term',
  LINK: 'DYNAMIC-link',
  EXT_ROR: 'DYNAMIC-ext-ror',
  EXT_ORCID: 'DYNAMIC-ext-orcid',
  EXT_PFAS: 'DYNAMIC-ext-pfas',
  TEMPORAL: 'DYNAMIC-temporal',
  EMAIL: 'DYNAMIC-email',
  NUMERIC: 'DYNAMIC-numeric',
  PHONE_NUMBER: 'DYNAMIC-phone-number',
  RADIO: 'DYNAMIC-radio',
  CHECKBOX: 'DYNAMIC-checkbox',
  SINGLE_SELECT_LIST: 'DYNAMIC-single-select-list',
  MULTIPLE_SELECT_LIST: 'DYNAMIC-multiple-select-list',
  ATTRIBUTE_VALUE: 'DYNAMIC-attribute-value',
  BOOLEAN: 'DYNAMIC-boolean',

  STATIC_PAGE_BREAK: 'STATIC-page-break',
  STATIC_SECTION_BREAK: 'STATIC-section-break',
  STATIC_IMAGE: 'STATIC-image',
  STATIC_RICH_TEXT: 'STATIC-rich_text',
  STATIC_YOUTUBE: 'STATIC-youtube',
} as const;

export type CedarFieldTypeValue = (typeof CedarFieldTypeValues)[keyof typeof CedarFieldTypeValues] | null;

export class CedarFieldType {
  private readonly value: CedarFieldTypeValue | null;
  private readonly _uiInputType: UiInputType;
  private readonly _yamlType: YamlArtifactType;
  private readonly staticField;

  private constructor(value: CedarFieldTypeValue, uiInputType: UiInputType, yamlType: YamlArtifactType, staticField: boolean) {
    this.value = value;
    this._uiInputType = uiInputType;
    this._yamlType = yamlType;
    this.staticField = staticField;
  }

  public getValue(): CedarFieldTypeValue {
    return this.value;
  }

  public getUiInputType(): UiInputType {
    return this._uiInputType;
  }

  public getYamlType(): YamlArtifactType {
    return this._yamlType;
  }

  get isStaticField() {
    return this.staticField;
  }

  public static values(): CedarFieldType[] {
    return [
      CedarFieldType.TEXT,
      CedarFieldType.TEXTAREA,
      CedarFieldType.CONTROLLED_TERM,
      CedarFieldType.LINK,
      CedarFieldType.EXT_ROR,
      CedarFieldType.EXT_ORCID,
      CedarFieldType.EXT_PFAS,
      CedarFieldType.TEMPORAL,
      CedarFieldType.EMAIL,
      CedarFieldType.NUMERIC,
      CedarFieldType.PHONE_NUMBER,
      CedarFieldType.RADIO,
      CedarFieldType.CHECKBOX,
      CedarFieldType.SINGLE_SELECT_LIST,
      CedarFieldType.MULTIPLE_SELECT_LIST,
      CedarFieldType.ATTRIBUTE_VALUE,
      CedarFieldType.BOOLEAN,
      CedarFieldType.STATIC_PAGE_BREAK,
      CedarFieldType.STATIC_SECTION_BREAK,
      CedarFieldType.STATIC_IMAGE,
      CedarFieldType.STATIC_RICH_TEXT,
      CedarFieldType.STATIC_YOUTUBE,
    ];
  }

  public static TEXT = new CedarFieldType(CedarFieldTypeValues.TEXTFIELD, UiInputType.TEXTFIELD, YamlArtifactType.TEXTFIELD, false);
  public static TEXTAREA = new CedarFieldType(CedarFieldTypeValues.TEXTAREA, UiInputType.TEXTAREA, YamlArtifactType.TEXTAREA, false);
  public static CONTROLLED_TERM = new CedarFieldType(
    CedarFieldTypeValues.CONTROLLED_TERM,
    UiInputType.TEXTFIELD,
    YamlArtifactType.CONTROLLED_TERM,
    false,
  );
  public static LINK = new CedarFieldType(CedarFieldTypeValues.LINK, UiInputType.LINK, YamlArtifactType.LINK, false);
  public static EXT_ROR = new CedarFieldType(CedarFieldTypeValues.EXT_ROR, UiInputType.EXT_ROR, YamlArtifactType.EXT_ROR, false);
  public static EXT_ORCID = new CedarFieldType(CedarFieldTypeValues.EXT_ORCID, UiInputType.EXT_ORCID, YamlArtifactType.EXT_ORCID, false);
  public static EXT_PFAS = new CedarFieldType(CedarFieldTypeValues.EXT_PFAS, UiInputType.EXT_PFAS, YamlArtifactType.EXT_PFAS, false);
  public static TEMPORAL = new CedarFieldType(CedarFieldTypeValues.TEMPORAL, UiInputType.TEMPORAL, YamlArtifactType.TEMPORAL, false);
  public static EMAIL = new CedarFieldType(CedarFieldTypeValues.EMAIL, UiInputType.EMAIL, YamlArtifactType.EMAIL, false);
  public static NUMERIC = new CedarFieldType(CedarFieldTypeValues.NUMERIC, UiInputType.NUMERIC, YamlArtifactType.NUMERIC, false);
  public static PHONE_NUMBER = new CedarFieldType(
    CedarFieldTypeValues.PHONE_NUMBER,
    UiInputType.PHONE_NUMBER,
    YamlArtifactType.PHONE_NUMBER,
    false,
  );
  public static RADIO = new CedarFieldType(CedarFieldTypeValues.RADIO, UiInputType.RADIO, YamlArtifactType.RADIO, false);
  public static CHECKBOX = new CedarFieldType(CedarFieldTypeValues.CHECKBOX, UiInputType.CHECKBOX, YamlArtifactType.CHECKBOX, false);
  public static SINGLE_SELECT_LIST = new CedarFieldType(
    CedarFieldTypeValues.SINGLE_SELECT_LIST,
    UiInputType.LIST,
    YamlArtifactType.SINGLE_SELECT_LIST,
    false,
  );
  public static MULTIPLE_SELECT_LIST = new CedarFieldType(
    CedarFieldTypeValues.MULTIPLE_SELECT_LIST,
    UiInputType.LIST,
    YamlArtifactType.SINGLE_SELECT_LIST,
    false,
  );
  public static ATTRIBUTE_VALUE = new CedarFieldType(
    CedarFieldTypeValues.ATTRIBUTE_VALUE,
    UiInputType.ATTRIBUTE_VALUE,
    YamlArtifactType.ATTRIBUTE_VALUE,
    false,
  );
  public static BOOLEAN = new CedarFieldType(CedarFieldTypeValues.BOOLEAN, UiInputType.BOOLEAN, YamlArtifactType.BOOLEAN, false);

  public static STATIC_PAGE_BREAK = new CedarFieldType(
    CedarFieldTypeValues.STATIC_PAGE_BREAK,
    UiInputType.PAGE_BREAK,
    YamlArtifactType.PAGE_BREAK,
    true,
  );
  public static STATIC_SECTION_BREAK = new CedarFieldType(
    CedarFieldTypeValues.STATIC_SECTION_BREAK,
    UiInputType.SECTION_BREAK,
    YamlArtifactType.SECTION_BREAK,
    true,
  );
  public static STATIC_IMAGE = new CedarFieldType(CedarFieldTypeValues.STATIC_IMAGE, UiInputType.IMAGE, YamlArtifactType.IMAGE, true);
  public static STATIC_RICH_TEXT = new CedarFieldType(
    CedarFieldTypeValues.STATIC_RICH_TEXT,
    UiInputType.RICH_TEXT,
    YamlArtifactType.RICH_TEXT,
    true,
  );
  public static STATIC_YOUTUBE = new CedarFieldType(
    CedarFieldTypeValues.STATIC_YOUTUBE,
    UiInputType.YOUTUBE,
    YamlArtifactType.YOUTUBE,
    true,
  );

  public static NULL = new CedarFieldType(null, UiInputType.NULL, YamlArtifactType.NULL, true);

  static forUiInputType(uiInputType: UiInputType): CedarFieldType {
    for (const fieldType of CedarFieldType.values()) {
      if (fieldType.getUiInputType() === uiInputType) {
        return fieldType;
      }
    }
    return this.NULL;
  }

  static forYamlArtifactType(yamlArtifactType: YamlArtifactType): CedarFieldType {
    for (const fieldType of CedarFieldType.values()) {
      if (fieldType.getYamlType() === yamlArtifactType) {
        return fieldType;
      }
    }
    return this.NULL;
  }
}
