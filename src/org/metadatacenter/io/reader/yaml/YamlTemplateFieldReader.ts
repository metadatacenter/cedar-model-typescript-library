import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { ReaderUtil } from '../ReaderUtil';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { YamlFieldReaderEmail } from '../../../model/cedar/field/dynamic/email/YamlFieldReaderEmail';
import { UiInputType } from '../../../model/cedar/types/wrapped-types/UiInputType';
import { CedarFieldType } from '../../../model/cedar/types/cedar-types/CedarFieldType';
import { YamlTemplateFieldReaderResult } from './YamlTemplateFieldReaderResult';
import { UnknownTemplateField } from '../../../model/cedar/field/UnknownTemplateField';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { YamlAbstractArtifactReader } from './YamlAbstractArtifactReader';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlTemplateFieldTypeSpecificReader } from './YamlTemplateFieldTypeSpecificReader';
import YAML from 'yaml';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';
import { YamlFieldReaderTextField } from '../../../model/cedar/field/dynamic/textfield/YamlFieldReaderTextField';
import { YamlFieldReaderTextArea } from '../../../model/cedar/field/dynamic/textarea/YamlFieldReaderTextArea';
import { YamlFieldReaderTemporal } from '../../../model/cedar/field/dynamic/temporal/YamlFieldReaderTemporal';
import { YamlFieldReaderNumeric } from '../../../model/cedar/field/dynamic/numeric/YamlFieldReaderNumeric';
import { YamlFieldReaderAttributeValue } from '../../../model/cedar/field/dynamic/attribute-value/YamlFieldReaderAttributeValue';
import { YamlFieldReaderPageBreak } from '../../../model/cedar/field/static/page-break/YamlFieldReaderPageBreak';
import { YamlFieldReaderLink } from '../../../model/cedar/field/dynamic/link/YamlFieldReaderLink';
import { YamlFieldReaderSectionBreak } from '../../../model/cedar/field/static/section-break/YamlFieldReaderSectionBreak';
import { YamlFieldReaderImage } from '../../../model/cedar/field/static/image/YamlFieldReaderImage';
import { YamlFieldReaderRichText } from '../../../model/cedar/field/static/rich-text/YamlFieldReaderRichText';
import { YamlFieldReaderYoutube } from '../../../model/cedar/field/static/youtube/YamlFieldReaderYoutube';
import { YamlFieldReaderPhoneNumber } from '../../../model/cedar/field/dynamic/phone-number/YamlFieldReaderPhoneNumber';
import { YamlFieldReaderCheckbox } from '../../../model/cedar/field/dynamic/checkbox/YamlFieldReaderCheckbox';
import { YamlFieldReaderSingleSelectList } from '../../../model/cedar/field/dynamic/list-single-choice/YamlFieldReaderSingleSelectList';
import { YamlFieldReaderMultiSelectList } from '../../../model/cedar/field/dynamic/list-multiple-choice/YamlFieldReaderMultiSelectList';
import { YamlFieldReaderRadio } from '../../../model/cedar/field/dynamic/radio/YamlFieldReaderRadio';
import { YamlFieldReaderControlledTerm } from '../../../model/cedar/field/dynamic/controlled-term/YamlFieldReaderControlledTerm';
import { YamlFieldReaderBoolean } from '../../../model/cedar/field/dynamic/boolean/YamlFieldReaderBoolean';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';
import { YamlFieldReaderExtRor } from '../../../model/cedar/field/dynamic/ext-ror/YamlFieldReaderExtRor';
import { YamlFieldReaderExtOrcid } from '../../../model/cedar/field/dynamic/ext-orcid/YamlFieldReaderExtOrcid';
import { YamlFieldReaderExtPfas } from '../../../model/cedar/field/dynamic/ext-pfas/YamlFieldReaderExtPfas';

export class YamlTemplateFieldReader extends YamlAbstractArtifactReader {
  private constructor(behavior: YamlReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): YamlTemplateFieldReader {
    return new YamlTemplateFieldReader(YamlReaderBehavior.STRICT);
  }

  public static getForBehavior(behavior: YamlReaderBehavior): YamlTemplateFieldReader {
    return new YamlTemplateFieldReader(behavior);
  }

  static readerMap = new Map<YamlArtifactType, YamlTemplateFieldTypeSpecificReader>([
    [YamlArtifactType.TEXTFIELD, new YamlFieldReaderTextField()],
    [YamlArtifactType.TEXTAREA, new YamlFieldReaderTextArea()],
    [YamlArtifactType.CONTROLLED_TERM, new YamlFieldReaderControlledTerm()],
    [YamlArtifactType.LINK, new YamlFieldReaderLink()],
    [YamlArtifactType.EXT_ROR, new YamlFieldReaderExtRor()],
    [YamlArtifactType.EXT_ORCID, new YamlFieldReaderExtOrcid()],
    [YamlArtifactType.EXT_PFAS, new YamlFieldReaderExtPfas()],
    [YamlArtifactType.TEMPORAL, new YamlFieldReaderTemporal()],
    [YamlArtifactType.EMAIL, new YamlFieldReaderEmail()],
    [YamlArtifactType.NUMERIC, new YamlFieldReaderNumeric()],
    [YamlArtifactType.PHONE_NUMBER, new YamlFieldReaderPhoneNumber()],
    [YamlArtifactType.RADIO, new YamlFieldReaderRadio()],
    [YamlArtifactType.CHECKBOX, new YamlFieldReaderCheckbox()],
    [YamlArtifactType.SINGLE_SELECT_LIST, new YamlFieldReaderSingleSelectList()],
    [YamlArtifactType.MULTI_SELECT_LIST, new YamlFieldReaderMultiSelectList()],
    [YamlArtifactType.ATTRIBUTE_VALUE, new YamlFieldReaderAttributeValue()],
    [YamlArtifactType.BOOLEAN, new YamlFieldReaderBoolean()],
    [YamlArtifactType.PAGE_BREAK, new YamlFieldReaderPageBreak()],
    [YamlArtifactType.SECTION_BREAK, new YamlFieldReaderSectionBreak()],
    [YamlArtifactType.IMAGE, new YamlFieldReaderImage()],
    [YamlArtifactType.RICH_TEXT, new YamlFieldReaderRichText()],
    [YamlArtifactType.YOUTUBE, new YamlFieldReaderYoutube()],
  ]);

  public readFromString(fieldSourceString: string): YamlTemplateFieldReaderResult {
    let fieldObject;
    try {
      fieldObject = YAML.parse(fieldSourceString);
    } catch (Exception) {
      fieldObject = {};
    }
    return this.readFromObject(fieldObject, ChildDeploymentInfo.empty(), new JsonPath());
  }

  public readFromObject(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, path: JsonPath): YamlTemplateFieldReaderResult {
    const parsingResult: YamlArtifactParsingResult = new YamlArtifactParsingResult();
    const field: TemplateField = YamlTemplateFieldReader.readFieldSpecificAttributes(fieldSourceObject, childInfo, parsingResult, path);
    this.readNonReportableAttributes(field, fieldSourceObject);
    this.readAnnotations(field, fieldSourceObject, parsingResult, path);
    return new YamlTemplateFieldReaderResult(field, parsingResult, fieldSourceObject);
  }

  protected readNonReportableAttributes(field: TemplateField, fieldSourceObject: JsonNode) {
    super.readNonReportableAttributes(field, fieldSourceObject);
    // Read field-specific nodes
    field.skos_prefLabel = ReaderUtil.getString(fieldSourceObject, YamlKeys.prefLabel);
    field.skos_altLabel = ReaderUtil.getFilteredStringList(fieldSourceObject, YamlKeys.altLabels);
  }

  private static readFieldSpecificAttributes(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    parsingResult: YamlArtifactParsingResult,
    path: JsonPath,
  ): TemplateField {
    const yamlArtifactType: YamlArtifactType = YamlArtifactType.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.type));
    if (yamlArtifactType.isField()) {
      const reader: YamlTemplateFieldTypeSpecificReader | undefined = this.readerMap.get(yamlArtifactType);
      if (!reader) {
        throw new Error(`No reader defined for dynamic input type "${yamlArtifactType.getValue()}"`);
      }
      const templateField: TemplateField = reader.read(fieldSourceObject, childInfo, parsingResult, path);
      let cedarArtifactType: CedarArtifactType = CedarArtifactType.NULL;
      if (yamlArtifactType.isStaticField()) {
        cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
      } else if (yamlArtifactType.isDynamicField()) {
        cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
      }
      templateField.cedarArtifactType = cedarArtifactType;
      return templateField;
    }

    return UnknownTemplateField.build();
  }

  private static fieldHasValueConstraint(fieldSourceObject: JsonNode) {
    const vcNode: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    const ontologies: Array<JsonNode> = ReaderUtil.getNodeList(vcNode, CedarModel.ontologies);
    if (ontologies.length > 0) {
      return true;
    }
    const branches: Array<JsonNode> = ReaderUtil.getNodeList(vcNode, CedarModel.branches);
    if (branches.length > 0) {
      return true;
    }
    const classes: Array<JsonNode> = ReaderUtil.getNodeList(vcNode, CedarModel.classes);
    if (classes.length > 0) {
      return true;
    }
    const valueSets: Array<JsonNode> = ReaderUtil.getNodeList(vcNode, CedarModel.valueSets);
    return valueSets.length > 0;
  }

  private static getCedarFieldType(fieldSourceObject: JsonNode, uiInputType: UiInputType): CedarFieldType {
    let fieldType: CedarFieldType = CedarFieldType.forUiInputType(uiInputType);
    // The map used in the method will guarantee that TEXT is always returned, but we double-check anyway
    if (fieldType === CedarFieldType.TEXT || fieldType === CedarFieldType.CONTROLLED_TERM) {
      if (this.fieldHasValueConstraint(fieldSourceObject)) {
        fieldType = CedarFieldType.CONTROLLED_TERM;
      } else {
        fieldType = CedarFieldType.TEXT;
      }
    }
    return fieldType;
  }
}
