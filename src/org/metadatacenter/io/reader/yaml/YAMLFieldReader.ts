import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { ReaderUtil } from '../ReaderUtil';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { YAMLFieldReaderEmail } from '../../../model/cedar/field/dynamic/email/YAMLFieldReaderEmail';
import { UiInputType } from '../../../model/cedar/types/wrapped-types/UiInputType';
import { CedarFieldType } from '../../../model/cedar/types/cedar-types/CedarFieldType';
import { YAMLFieldReaderResult } from './YAMLFieldReaderResult';
import { UnknownTemplateField } from '../../../model/cedar/field/UnknownTemplateField';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { YAMLAbstractArtifactReader } from './YAMLAbstractArtifactReader';
import { YAMLReaderBehavior } from '../../../behavior/YAMLReaderBehavior';
import { YAMLFieldTypeSpecificReader } from './YAMLFieldTypeSpecificReader';
import YAML from 'yaml';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';
import { YAMLFieldReaderTextField } from '../../../model/cedar/field/dynamic/textfield/YAMLFieldReaderTextField';
import { YAMLFieldReaderTextArea } from '../../../model/cedar/field/dynamic/textarea/YAMLFieldReaderTextArea';
import { YAMLFieldReaderTemporal } from '../../../model/cedar/field/dynamic/temporal/YAMLFieldReaderTemporal';
import { YAMLFieldReaderNumeric } from '../../../model/cedar/field/dynamic/numeric/YAMLFieldReaderNumeric';
import { YAMLFieldReaderAttributeValue } from '../../../model/cedar/field/dynamic/attribute-value/YAMLFieldReaderAttributeValue';
import { YAMLFieldReaderPageBreak } from '../../../model/cedar/field/static/page-break/YAMLFieldReaderPageBreak';
import { YAMLFieldReaderLink } from '../../../model/cedar/field/dynamic/link/YAMLFieldReaderLink';
import { YAMLFieldReaderSectionBreak } from '../../../model/cedar/field/static/section-break/YAMLFieldReaderSectionBreak';
import { YAMLFieldReaderImage } from '../../../model/cedar/field/static/image/YAMLFieldReaderImage';
import { YAMLFieldReaderRichText } from '../../../model/cedar/field/static/rich-text/YAMLFieldReaderRichText';
import { YAMLFieldReaderYoutube } from '../../../model/cedar/field/static/youtube/YAMLFieldReaderYoutube';
import { YAMLFieldReaderPhoneNumber } from '../../../model/cedar/field/dynamic/phone-number/YAMLFieldReaderPhoneNumber';
import { YAMLFieldReaderCheckbox } from '../../../model/cedar/field/dynamic/checkbox/YAMLFieldReaderCheckbox';
import { YAMLFieldReaderSingleSelectList } from '../../../model/cedar/field/dynamic/list/YAMLFieldReaderSingleSelectList';
import { YAMLFieldReaderMultiSelectList } from '../../../model/cedar/field/dynamic/list/YAMLFieldReaderMultiSelectList';
import { YAMLFieldReaderRadio } from '../../../model/cedar/field/dynamic/radio/YAMLFieldReaderRadio';
import { YAMLFieldReaderControlledTerm } from '../../../model/cedar/field/dynamic/controlled-term/YAMLFieldReaderControlledTerm';

export class YAMLFieldReader extends YAMLAbstractArtifactReader {
  private constructor(behavior: YAMLReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): YAMLFieldReader {
    return new YAMLFieldReader(YAMLReaderBehavior.STRICT);
  }

  public static getForBehavior(behavior: YAMLReaderBehavior): YAMLFieldReader {
    return new YAMLFieldReader(behavior);
  }

  static readerMap = new Map<YamlArtifactType, YAMLFieldTypeSpecificReader>([
    [YamlArtifactType.TEXTFIELD, new YAMLFieldReaderTextField()],
    [YamlArtifactType.TEXTAREA, new YAMLFieldReaderTextArea()],
    [YamlArtifactType.CONTROLLED_TERM, new YAMLFieldReaderControlledTerm()],
    [YamlArtifactType.LINK, new YAMLFieldReaderLink()],
    [YamlArtifactType.TEMPORAL, new YAMLFieldReaderTemporal()],
    [YamlArtifactType.EMAIL, new YAMLFieldReaderEmail()],
    [YamlArtifactType.NUMERIC, new YAMLFieldReaderNumeric()],
    [YamlArtifactType.PHONE_NUMBER, new YAMLFieldReaderPhoneNumber()],
    [YamlArtifactType.RADIO, new YAMLFieldReaderRadio()],
    [YamlArtifactType.CHECKBOX, new YAMLFieldReaderCheckbox()],
    [YamlArtifactType.SINGLE_SELECT_LIST, new YAMLFieldReaderSingleSelectList()],
    [YamlArtifactType.MULTI_SELECT_LIST, new YAMLFieldReaderMultiSelectList()],
    [YamlArtifactType.ATTRIBUTE_VALUE, new YAMLFieldReaderAttributeValue()],
    [YamlArtifactType.PAGE_BREAK, new YAMLFieldReaderPageBreak()],
    [YamlArtifactType.SECTION_BREAK, new YAMLFieldReaderSectionBreak()],
    [YamlArtifactType.IMAGE, new YAMLFieldReaderImage()],
    [YamlArtifactType.RICH_TEXT, new YAMLFieldReaderRichText()],
    [YamlArtifactType.YOUTUBE, new YAMLFieldReaderYoutube()],
  ]);

  public readFromString(fieldSourceString: string): YAMLFieldReaderResult {
    let fieldObject;
    try {
      fieldObject = YAML.parse(fieldSourceString);
    } catch (Exception) {
      fieldObject = {};
    }
    return this.readFromObject(fieldObject, ChildDeploymentInfo.empty(), new JsonPath());
  }

  public readFromObject(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, path: JsonPath): YAMLFieldReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const field: TemplateField = YAMLFieldReader.readFieldSpecificAttributes(fieldSourceObject, childInfo, parsingResult, path);
    this.readNonReportableAttributes(field, fieldSourceObject);
    this.readAnnotations(field, fieldSourceObject, parsingResult, path);
    return new YAMLFieldReaderResult(field, parsingResult, fieldSourceObject);
  }

  protected readNonReportableAttributes(field: TemplateField, fieldSourceObject: JsonNode) {
    super.readNonReportableAttributes(field, fieldSourceObject);
    // Read field-specific nodes
    field.skos_prefLabel = ReaderUtil.getString(fieldSourceObject, YamlKeys.prefLabel);
    field.skos_altLabel = ReaderUtil.getStringList(fieldSourceObject, YamlKeys.altLabel);
  }

  private static readFieldSpecificAttributes(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    parsingResult: ParsingResult,
    path: JsonPath,
  ): TemplateField {
    const yamlArtifactType: YamlArtifactType = YamlArtifactType.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.type));
    if (yamlArtifactType.isField()) {
      const reader: YAMLFieldTypeSpecificReader | undefined = this.readerMap.get(yamlArtifactType);
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
    if (valueSets.length > 0) {
      return true;
    }
    return false;
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
