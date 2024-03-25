import { JsonNode, JsonNodeClass } from '../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../model/cedar/util/path/JsonPath';
import { TemplateField } from '../../model/cedar/field/TemplateField';
import { ReaderUtil } from './ReaderUtil';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { ObjectComparator } from '../../model/cedar/util/compare/ObjectComparator';
import { CedarArtifactType } from '../../model/cedar/types/cedar-types/CedarArtifactType';
import { JavascriptType } from '../../model/cedar/types/wrapped-types/JavascriptType';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { ArtifactSchema } from '../../model/cedar/types/wrapped-types/ArtifactSchema';
import { JSONTemplateFieldContentDynamic } from '../../model/cedar/util/serialization/JSONTemplateFieldContentDynamic';
import { JSONFieldReaderTextField } from '../../model/cedar/field/dynamic/textfield/JSONFieldReaderTextField';
import { JSONFieldReaderPageBreak } from '../../model/cedar/field/static/page-break/JSONFieldReaderPageBreak';
import { JSONFieldReaderSectionBreak } from '../../model/cedar/field/static/section-break/JSONFieldReaderSectionBreak';
import { JSONFieldReaderImage } from '../../model/cedar/field/static/image/JSONFieldReaderImage';
import { JSONFieldReaderRichText } from '../../model/cedar/field/static/rich-text/JSONFieldReaderRichText';
import { JSONFieldReaderYoutube } from '../../model/cedar/field/static/youtube/JSONFieldReaderYoutube';
import { JSONFieldReaderLink } from '../../model/cedar/field/dynamic/link/JSONFieldReaderLink';
import { JSONTemplateFieldContentStatic } from '../../model/cedar/util/serialization/JSONTemplateFieldContentStatic';
import { JSONFieldReaderTemporal } from '../../model/cedar/field/dynamic/temporal/JSONFieldReaderTemporal';
import { JSONFieldReaderEmail } from '../../model/cedar/field/dynamic/email/JSONFieldReaderEmail';
import { JSONFieldReaderNumeric } from '../../model/cedar/field/dynamic/numeric/JSONFieldReaderNumeric';
import { JSONFieldReaderTextArea } from '../../model/cedar/field/dynamic/textarea/JSONFieldReaderTextArea';
import { JSONFieldReaderPhoneNumber } from '../../model/cedar/field/dynamic/phone-number/JSONFieldReaderPhoneNumber';
import { JSONFieldReaderRadio } from '../../model/cedar/field/dynamic/radio/JSONFieldReaderRadio';
import { JSONFieldTypeSpecificReader } from './JSONFieldTypeSpecificReader';
import { UiInputType } from '../../model/cedar/types/wrapped-types/UiInputType';
import { JSONFieldReaderCheckbox } from '../../model/cedar/field/dynamic/checkbox/JSONFieldReaderCheckbox';
import { JSONFieldReaderList } from '../../model/cedar/field/dynamic/list/JSONFieldReaderList';
import { JSONFieldReaderAttributeValue } from '../../model/cedar/field/dynamic/attribute-value/JSONFieldReaderAttributeValue';
import { CedarFieldType } from '../../model/cedar/types/cedar-types/CedarFieldType';
import { JSONFieldReaderControlledTerm } from '../../model/cedar/field/dynamic/controlled-term/JSONFieldReaderControlledTerm';
import { JSONReaderBehavior } from '../../behavior/JSONReaderBehavior';
import { JSONFieldReaderResult } from './JSONFieldReaderResult';
import { JSONTemplateFieldWriterInternal } from '../writer/JSONTemplateFieldWriterInternal';
import { UnknownTemplateField } from '../../model/cedar/field/UnknownTemplateField';
import { JSONAbstractArtifactReader } from './JSONAbstractArtifactReader';
import { ChildDeploymentInfo } from '../../model/cedar/deployment/ChildDeploymentInfo';

export class JSONFieldReader extends JSONAbstractArtifactReader {
  private constructor(behavior: JSONReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): JSONFieldReader {
    return new JSONFieldReader(JSONReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JSONFieldReader {
    return new JSONFieldReader(JSONReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JSONReaderBehavior): JSONFieldReader {
    return new JSONFieldReader(behavior);
  }

  static dynamicTypeReaderMap = new Map<CedarFieldType, JSONFieldTypeSpecificReader>([
    [CedarFieldType.TEXT, new JSONFieldReaderTextField()],
    [CedarFieldType.TEXTAREA, new JSONFieldReaderTextArea()],
    [CedarFieldType.CONTROLLED_TERM, new JSONFieldReaderControlledTerm()],
    [CedarFieldType.LINK, new JSONFieldReaderLink()],
    [CedarFieldType.TEMPORAL, new JSONFieldReaderTemporal()],
    [CedarFieldType.EMAIL, new JSONFieldReaderEmail()],
    [CedarFieldType.NUMERIC, new JSONFieldReaderNumeric()],
    [CedarFieldType.PHONE_NUMBER, new JSONFieldReaderPhoneNumber()],
    [CedarFieldType.RADIO, new JSONFieldReaderRadio()],
    [CedarFieldType.CHECKBOX, new JSONFieldReaderCheckbox()],
    [CedarFieldType.LIST, new JSONFieldReaderList()],
    [CedarFieldType.ATTRIBUTE_VALUE, new JSONFieldReaderAttributeValue()],
  ]);

  static staticReaderMap = new Map<CedarFieldType, JSONFieldTypeSpecificReader>([
    [CedarFieldType.STATIC_PAGE_BREAK, new JSONFieldReaderPageBreak()],
    [CedarFieldType.STATIC_SECTION_BREAK, new JSONFieldReaderSectionBreak()],
    [CedarFieldType.STATIC_IMAGE, new JSONFieldReaderImage()],
    [CedarFieldType.STATIC_RICH_TEXT, new JSONFieldReaderRichText()],
    [CedarFieldType.STATIC_YOUTUBE, new JSONFieldReaderYoutube()],
  ]);

  public readFromString(fieldSourceString: string): JSONFieldReaderResult {
    let fieldObject;
    try {
      fieldObject = JSON.parse(fieldSourceString);
    } catch (Exception) {
      fieldObject = {};
    }
    return this.readFromObject(fieldObject, ChildDeploymentInfo.empty(), new JsonPath());
  }

  public readFromObject(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, path: JsonPath): JSONFieldReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const field: TemplateField = JSONFieldReader.readFieldSpecificAttributes(fieldSourceObject, childInfo, parsingResult, path);
    this.readNonReportableAttributes(field, fieldSourceObject);
    this.readReportableAttributes(field, fieldSourceObject, parsingResult, path);
    this.readAnnotations(field, fieldSourceObject, parsingResult, path);
    return new JSONFieldReaderResult(field, parsingResult, fieldSourceObject);
  }

  protected readNonReportableAttributes(field: TemplateField, fieldSourceObject: JsonNode) {
    super.readNonReportableAttributes(field, fieldSourceObject);
    // Read field-specific nodes
    field.skos_prefLabel = ReaderUtil.getString(fieldSourceObject, CedarModel.skosPrefLabel);
  }

  private readReportableAttributes(field: TemplateField, fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: JsonPath) {
    // Read and validate, but do not store top level @type

    // Read and validate, but do not store top level @context
    const topContextNode: JsonNode = ReaderUtil.getNode(fieldSourceObject, JsonSchema.atContext);
    let blueprintAtContext: JsonNode = JsonNodeClass.getEmpty();
    if (field.cedarArtifactType == CedarArtifactType.TEMPLATE_FIELD) {
      if (this.behavior.includeBiboInContext()) {
        blueprintAtContext = JSONTemplateFieldContentDynamic.CONTEXT_VERBATIM;
      } else {
        blueprintAtContext = JSONTemplateFieldContentDynamic.CONTEXT_VERBATIM_NO_BIBO;
      }
    } else if (field.cedarArtifactType == CedarArtifactType.STATIC_TEMPLATE_FIELD) {
      if (this.behavior.includeBiboInContext()) {
        blueprintAtContext = JSONTemplateFieldContentStatic.CONTEXT_VERBATIM;
      } else {
        blueprintAtContext = JSONTemplateFieldContentStatic.CONTEXT_VERBATIM_NO_BIBO;
      }
    }
    ObjectComparator.compareBothWays(parsingResult, blueprintAtContext, topContextNode, path.add(JsonSchema.atContext));

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
        const reader: JSONFieldTypeSpecificReader | undefined = this.staticReaderMap.get(fieldType);
        if (!reader) {
          throw new Error(`No reader defined for static input type "${fieldType.getValue()}"`);
        }
        return reader.read(fieldSourceObject, childInfo, parsingResult, path);
      }
    } else if (artifactType == CedarArtifactType.TEMPLATE_FIELD) {
      if (uiInputType != null) {
        const reader: JSONFieldTypeSpecificReader | undefined = this.dynamicTypeReaderMap.get(fieldType);
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

  static getRoundTripComparisonResult(
    jsonFieldReaderResult: JSONFieldReaderResult,
    writer: JSONTemplateFieldWriterInternal,
  ): ParsingResult {
    const compareResult = new ParsingResult();
    ObjectComparator.compareBothWays(
      compareResult,
      jsonFieldReaderResult.fieldSourceObject,
      writer.getAsJsonNode(jsonFieldReaderResult.field, ChildDeploymentInfo.empty()),
      new JsonPath(),
    );
    return compareResult;
  }
}
