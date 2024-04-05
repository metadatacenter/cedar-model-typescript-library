import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { ObjectComparator } from '../../../model/cedar/util/compare/ObjectComparator';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JavascriptType } from '../../../model/cedar/types/wrapped-types/JavascriptType';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { ArtifactSchema } from '../../../model/cedar/types/wrapped-types/ArtifactSchema';
import { JsonTemplateFieldContentDynamic } from '../../../model/cedar/util/serialization/JsonTemplateFieldContentDynamic';
import { JsonFieldReaderTextField } from '../../../model/cedar/field/dynamic/textfield/JsonFieldReaderTextField';
import { JsonFieldReaderPageBreak } from '../../../model/cedar/field/static/page-break/JsonFieldReaderPageBreak';
import { JsonFieldReaderSectionBreak } from '../../../model/cedar/field/static/section-break/JsonFieldReaderSectionBreak';
import { JsonFieldReaderImage } from '../../../model/cedar/field/static/image/JsonFieldReaderImage';
import { JsonFieldReaderRichText } from '../../../model/cedar/field/static/rich-text/JsonFieldReaderRichText';
import { JsonFieldReaderYoutube } from '../../../model/cedar/field/static/youtube/JsonFieldReaderYoutube';
import { JsonFieldReaderLink } from '../../../model/cedar/field/dynamic/link/JsonFieldReaderLink';
import { JsonTemplateFieldContentStatic } from '../../../model/cedar/util/serialization/JsonTemplateFieldContentStatic';
import { JsonFieldReaderTemporal } from '../../../model/cedar/field/dynamic/temporal/JsonFieldReaderTemporal';
import { JsonFieldReaderEmail } from '../../../model/cedar/field/dynamic/email/JsonFieldReaderEmail';
import { JsonFieldReaderNumeric } from '../../../model/cedar/field/dynamic/numeric/JsonFieldReaderNumeric';
import { JsonFieldReaderTextArea } from '../../../model/cedar/field/dynamic/textarea/JsonFieldReaderTextArea';
import { JsonFieldReaderPhoneNumber } from '../../../model/cedar/field/dynamic/phone-number/JsonFieldReaderPhoneNumber';
import { JsonFieldReaderRadio } from '../../../model/cedar/field/dynamic/radio/JsonFieldReaderRadio';
import { JsonTemplateFieldTypeSpecificReader } from './JsonTemplateFieldTypeSpecificReader';
import { UiInputType } from '../../../model/cedar/types/wrapped-types/UiInputType';
import { JsonFieldReaderCheckbox } from '../../../model/cedar/field/dynamic/checkbox/JsonFieldReaderCheckbox';
import { JsonFieldReaderList } from '../../../model/cedar/field/dynamic/list/JsonFieldReaderList';
import { JsonFieldReaderAttributeValue } from '../../../model/cedar/field/dynamic/attribute-value/JsonFieldReaderAttributeValue';
import { CedarFieldType } from '../../../model/cedar/types/cedar-types/CedarFieldType';
import { JsonFieldReaderControlledTerm } from '../../../model/cedar/field/dynamic/controlled-term/JsonFieldReaderControlledTerm';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonTemplateFieldReaderResult } from './JsonTemplateFieldReaderResult';
import { UnknownTemplateField } from '../../../model/cedar/field/UnknownTemplateField';
import { JsonAbstractSchemaArtifactReader } from './JsonAbstractSchemaArtifactReader';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';

export class JsonTemplateFieldReader extends JsonAbstractSchemaArtifactReader {
  private constructor(behavior: JsonReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): JsonTemplateFieldReader {
    return new JsonTemplateFieldReader(JsonReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JsonTemplateFieldReader {
    return new JsonTemplateFieldReader(JsonReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JsonReaderBehavior): JsonTemplateFieldReader {
    return new JsonTemplateFieldReader(behavior);
  }

  static dynamicTypeReaderMap = new Map<CedarFieldType, JsonTemplateFieldTypeSpecificReader>([
    [CedarFieldType.TEXT, new JsonFieldReaderTextField()],
    [CedarFieldType.TEXTAREA, new JsonFieldReaderTextArea()],
    [CedarFieldType.CONTROLLED_TERM, new JsonFieldReaderControlledTerm()],
    [CedarFieldType.LINK, new JsonFieldReaderLink()],
    [CedarFieldType.TEMPORAL, new JsonFieldReaderTemporal()],
    [CedarFieldType.EMAIL, new JsonFieldReaderEmail()],
    [CedarFieldType.NUMERIC, new JsonFieldReaderNumeric()],
    [CedarFieldType.PHONE_NUMBER, new JsonFieldReaderPhoneNumber()],
    [CedarFieldType.RADIO, new JsonFieldReaderRadio()],
    [CedarFieldType.CHECKBOX, new JsonFieldReaderCheckbox()],
    [CedarFieldType.LIST, new JsonFieldReaderList()],
    [CedarFieldType.ATTRIBUTE_VALUE, new JsonFieldReaderAttributeValue()],
  ]);

  static staticReaderMap = new Map<CedarFieldType, JsonTemplateFieldTypeSpecificReader>([
    [CedarFieldType.STATIC_PAGE_BREAK, new JsonFieldReaderPageBreak()],
    [CedarFieldType.STATIC_SECTION_BREAK, new JsonFieldReaderSectionBreak()],
    [CedarFieldType.STATIC_IMAGE, new JsonFieldReaderImage()],
    [CedarFieldType.STATIC_RICH_TEXT, new JsonFieldReaderRichText()],
    [CedarFieldType.STATIC_YOUTUBE, new JsonFieldReaderYoutube()],
  ]);

  public readFromString(fieldSourceString: string): JsonTemplateFieldReaderResult {
    let fieldObject;
    try {
      fieldObject = JSON.parse(fieldSourceString);
    } catch (Exception) {
      fieldObject = {};
    }
    return this.readFromObject(fieldObject, ChildDeploymentInfo.empty(), new JsonPath());
  }

  public readFromObject(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, path: JsonPath): JsonTemplateFieldReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const field: TemplateField = JsonTemplateFieldReader.readFieldSpecificAttributes(fieldSourceObject, childInfo, parsingResult, path);
    this.readNonReportableAttributes(field, fieldSourceObject);
    this.readReportableAttributes(field, fieldSourceObject, parsingResult, path);
    this.readAnnotations(field, fieldSourceObject, parsingResult, path);
    return new JsonTemplateFieldReaderResult(field, parsingResult, fieldSourceObject);
  }

  protected readNonReportableAttributes(field: TemplateField, fieldSourceObject: JsonNode) {
    super.readNonReportableAttributes(field, fieldSourceObject);
    // Read field-specific nodes
    field.skos_prefLabel = ReaderUtil.getString(fieldSourceObject, CedarModel.skosPrefLabel);
    field.skos_altLabel = ReaderUtil.getStringList(fieldSourceObject, CedarModel.skosAltLabel);
  }

  private readReportableAttributes(field: TemplateField, fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: JsonPath) {
    // Read and validate, but do not store top level @type

    // Read and validate, but do not store top level @context
    const topContextNode: JsonNode = ReaderUtil.getNode(fieldSourceObject, JsonSchema.atContext);
    let blueprintAtContext: JsonNode = JsonNode.getEmpty();
    if (field.cedarArtifactType == CedarArtifactType.TEMPLATE_FIELD) {
      blueprintAtContext = JsonTemplateFieldContentDynamic.CONTEXT_VERBATIM;
    } else if (field.cedarArtifactType == CedarArtifactType.STATIC_TEMPLATE_FIELD) {
      blueprintAtContext = JsonTemplateFieldContentStatic.CONTEXT_VERBATIM;
    }
    ObjectComparator.compareBothWays(parsingResult, blueprintAtContext, topContextNode, path.add(JsonSchema.atContext), this.behavior);

    // Read and validate, but do not store top level type
    // Attribute value requires string, the others object
    if (field.cedarFieldType === CedarFieldType.ATTRIBUTE_VALUE) {
      ObjectComparator.comparePrimitive(
        parsingResult,
        JavascriptType.STRING.getValue(),
        ReaderUtil.getString(fieldSourceObject, CedarModel.type),
        path.add(CedarModel.type),
      );
    } else {
      ObjectComparator.comparePrimitive(
        parsingResult,
        JavascriptType.OBJECT.getValue(),
        ReaderUtil.getString(fieldSourceObject, CedarModel.type),
        path.add(CedarModel.type),
      );
    }

    // Read and validate, but do not store top level additionalProperties
    ObjectComparator.comparePrimitive(
      parsingResult,
      false,
      ReaderUtil.getBoolean(fieldSourceObject, TemplateProperty.additionalProperties),
      path.add(TemplateProperty.additionalProperties),
    );

    // Read and validate, but do not store top level $schema
    ObjectComparator.comparePrimitive(
      parsingResult,
      ArtifactSchema.CURRENT.getValue(),
      ReaderUtil.getString(fieldSourceObject, CedarModel.schema),
      path.add(CedarModel.schema),
    );
  }

  private static readFieldSpecificAttributes(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    parsingResult: ParsingResult,
    path: JsonPath,
  ): TemplateField {
    const artifactType: CedarArtifactType = CedarArtifactType.forValue(ReaderUtil.getString(fieldSourceObject, JsonSchema.atType));
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    const uiInputType: UiInputType = UiInputType.forValue(ReaderUtil.getString(uiNode, CedarModel.inputType));
    const fieldType: CedarFieldType = this.getCedarFieldType(fieldSourceObject, uiInputType);
    if (artifactType == CedarArtifactType.STATIC_TEMPLATE_FIELD) {
      if (uiInputType != null) {
        const reader: JsonTemplateFieldTypeSpecificReader | undefined = this.staticReaderMap.get(fieldType);
        if (!reader) {
          throw new Error(`No reader defined for static input type "${fieldType.getValue()}"`);
        }
        return reader.read(fieldSourceObject, childInfo, parsingResult, path);
      }
    } else if (artifactType == CedarArtifactType.TEMPLATE_FIELD) {
      if (uiInputType != null) {
        const reader: JsonTemplateFieldTypeSpecificReader | undefined = this.dynamicTypeReaderMap.get(fieldType);
        if (!reader) {
          throw new Error(`No reader defined for dynamic input type "${fieldType.getValue()}"`);
        }
        return reader.read(fieldSourceObject, childInfo, parsingResult, path);
      }
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