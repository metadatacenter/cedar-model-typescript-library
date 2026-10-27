import { JsonArtifactShape } from './JsonArtifactShape';
import { JsonSourcePolicy } from '../../../policy/JsonSourcePolicy';
import { applySchemaReaderDefaults } from '../SchemaReaderDefaults';
import { SchemaArtifactKind } from '../../../model/cedar/AbstractSchemaArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { JsonObjectComparator } from '../../../model/cedar/util/compare/JsonObjectComparator';
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
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';
import { Language } from '../../../model/cedar/types/wrapped-types/Language';
import { JsonFieldReaderExtRor } from '../../../model/cedar/field/dynamic/ext-ror/JsonFieldReaderExtRor';
import { JsonFieldReaderExtOrcid } from '../../../model/cedar/field/dynamic/ext-orcid/JsonFieldReaderExtOrcid';
import { JsonFieldReaderExtPfas } from '../../../model/cedar/field/dynamic/ext-pfas/JsonFieldReaderExtPfas';
import { JsonFieldReaderExtPubmed } from '../../../model/cedar/field/dynamic/ext-pubmed/JsonFieldReaderExtPubmed';
import { JsonFieldReaderExtRrid } from '../../../model/cedar/field/dynamic/ext-rrid/JsonFieldReaderExtRrid';
import { JsonFieldReaderExtNihGrantId } from '../../../model/cedar/field/dynamic/ext-nih-grant-id/JsonFieldReaderExtNihGrantId';
import { JsonFieldReaderExtDoi } from '../../../model/cedar/field/dynamic/ext-doi/JsonFieldReaderExtDoi';
import { TextFieldImpl } from '../../../model/cedar/field/dynamic/textfield/TextFieldImpl';
import { ControlledTermFieldImpl } from '../../../model/cedar/field/dynamic/controlled-term/ControlledTermFieldImpl';
import { JsonTermConstraintChecks } from './JsonTermConstraintChecks';

export class JsonTemplateFieldReader extends JsonAbstractSchemaArtifactReader {
  protected artifactTypeWord(): SchemaArtifactKind {
    return 'field';
  }

  protected constructor(behavior: JsonReaderBehavior) {
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
    [CedarFieldType.EXT_ROR, new JsonFieldReaderExtRor()],
    [CedarFieldType.EXT_ORCID, new JsonFieldReaderExtOrcid()],
    [CedarFieldType.EXT_PFAS, new JsonFieldReaderExtPfas()],
    [CedarFieldType.EXT_PUBMED, new JsonFieldReaderExtPubmed()],
    [CedarFieldType.EXT_RRID, new JsonFieldReaderExtRrid()],
    [CedarFieldType.EXT_NIH_GRANT_ID, new JsonFieldReaderExtNihGrantId()],
    [CedarFieldType.EXT_DOI, new JsonFieldReaderExtDoi()],
    [CedarFieldType.TEMPORAL, new JsonFieldReaderTemporal()],
    [CedarFieldType.EMAIL, new JsonFieldReaderEmail()],
    [CedarFieldType.NUMERIC, new JsonFieldReaderNumeric()],
    [CedarFieldType.PHONE_NUMBER, new JsonFieldReaderPhoneNumber()],
    [CedarFieldType.RADIO, new JsonFieldReaderRadio()],
    [CedarFieldType.CHECKBOX, new JsonFieldReaderCheckbox()],
    [CedarFieldType.SINGLE_SELECT_LIST, new JsonFieldReaderList()],
    [CedarFieldType.MULTIPLE_SELECT_LIST, new JsonFieldReaderList()],
    [CedarFieldType.ATTRIBUTE_VALUE, new JsonFieldReaderAttributeValue()],
    [CedarFieldType.STATIC_PAGE_BREAK, new JsonFieldReaderPageBreak()],
    [CedarFieldType.STATIC_SECTION_BREAK, new JsonFieldReaderSectionBreak()],
    [CedarFieldType.STATIC_IMAGE, new JsonFieldReaderImage()],
    [CedarFieldType.STATIC_RICH_TEXT, new JsonFieldReaderRichText()],
    [CedarFieldType.STATIC_YOUTUBE, new JsonFieldReaderYoutube()],
  ]);

  public readFromString(fieldSourceString: string): JsonTemplateFieldReaderResult {
    const fieldObject = JsonSourcePolicy.parse(fieldSourceString);
    return this.readFromObject(fieldObject);
  }

  public readFromObject(fieldSourceObject: JsonNode): JsonTemplateFieldReaderResult {
    // Whether a field repeats, and how often, is what a template or element says of its child, so a
    // field written on its own has neither. The one array a standalone field document may be is the
    // meta-schema's form of an attribute-value field, a list of attribute names by nature, and the
    // bounds that array states are no field's. Any other array is refused, as Java's reader and the
    // validator refuse it. The historical unwrapped attribute-value definition is still accepted.
    if (fieldSourceObject.type === 'array') {
      const items = ReaderUtil.getNode(fieldSourceObject, JsonSchema.items);
      if (ReaderUtil.getNode(items, CedarModel.ui)[CedarModel.inputType] !== 'attribute-value') {
        throw new Error(
          'A field written on its own does not repeat, so it is an object, not an array; only a template or an element repeats a field, at /type.',
        );
      }
      fieldSourceObject = items;
    }
    // Whether a field is required or recommended is likewise what a parent says of its child. The
    // meta-schema requires every field to state requiredValue, so a field on its own states false,
    // as Java's reader requires. The compatibility reader reads past a stored requirement, which
    // fields written before this held, and keeps none.
    const valueConstraints = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    for (const [key, word] of [
      [CedarModel.requiredValue, 'required'],
      [CedarModel.ValueConstraints.recommendedValue, 'recommended'],
    ] as const) {
      if (valueConstraints[key] === true && !this.lenient) {
        throw new Error(
          `A field written on its own is not ${word}; only a template or an element requires or recommends a field, at /${CedarModel.valueConstraints}/${key}.`,
        );
      }
    }
    const childInfo: AbstractChildDeploymentInfo = ChildDeploymentInfo.standalone();
    const path: JsonPath = new JsonPath();
    return this.readFromObjectInternal(fieldSourceObject, childInfo, path);
  }

  protected readFromObjectInternal(
    fieldSourceObject: JsonNode,
    childInfo: AbstractChildDeploymentInfo,
    path: JsonPath,
  ): JsonTemplateFieldReaderResult {
    JsonArtifactShape.assertDeclaredKind(fieldSourceObject, path, 'field', this.lenient);
    // A child need not state the JSON Schema it is written in, as in Java.
    JsonArtifactShape.assertJsonSchemaUri(fieldSourceObject, path, path.getLastComponent() === null, this.lenient);
    JsonArtifactShape.assertModelVersion(fieldSourceObject, path, this.lenient);
    const parsingResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
    const field: TemplateField = JsonTemplateFieldReader.readFieldSpecificAttributes(fieldSourceObject, childInfo, parsingResult, path);
    // Standalone reads have no container to retain the deployment info. Keep the setting on the
    // field, where both standalone writers read it; children retain their container's setting.
    if (
      childInfo instanceof ChildDeploymentInfo &&
      childInfo.isStandalone() &&
      (field instanceof TextFieldImpl || field instanceof ControlledTermFieldImpl)
    ) {
      field.valueRecommendationEnabled = childInfo.valueRecommendationEnabled;
    }
    if (childInfo instanceof ChildDeploymentInfo && childInfo.isStandalone()) {
      const ui = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
      field.hidden = ReaderUtil.getBoolean(ui, CedarModel.Ui.hidden);
      field.continuePreviousLine = childInfo.continuePreviousLine;
      // A field written on its own is neither required nor recommended.
      field.requiredValue = false;
      field.recommendedValue = false;
    }
    // A child's `@id` may be a temporary one the server replaces on a write.
    if (childInfo instanceof ChildDeploymentInfo && childInfo.isStandalone()) {
      ReaderUtil.getArtifactIdentifier(fieldSourceObject, JsonSchema.atId, this.lenient);
    }
    this.readNonReportableAttributes(field, fieldSourceObject);
    applySchemaReaderDefaults(field, fieldSourceObject, path, 'json');
    this.readReportableAttributes(field, fieldSourceObject, parsingResult, path);
    this.readAnnotations(field, fieldSourceObject);
    return new JsonTemplateFieldReaderResult(field, parsingResult, fieldSourceObject);
  }

  protected readNonReportableAttributes(field: TemplateField, fieldSourceObject: JsonNode) {
    super.readNonReportableAttributes(field, fieldSourceObject);
    // Read field-specific nodes
    field.skos_prefLabel = ReaderUtil.getString(fieldSourceObject, CedarModel.skosPrefLabel);
    field.skos_altLabel = ReaderUtil.getFilteredStringList(fieldSourceObject, CedarModel.skosAltLabel);
  }

  protected readReportableAttributes(
    field: TemplateField,
    fieldSourceObject: JsonNode,
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
  ) {
    // Read and validate, but do not store top level @type

    // Read and validate, but do not store top level @context
    const topContextNode: JsonNode = ReaderUtil.getNode(fieldSourceObject, JsonSchema.atContext);
    let blueprintAtContext: JsonNode = JsonNode.getEmpty();
    if (field.cedarArtifactType == CedarArtifactType.TEMPLATE_FIELD) {
      blueprintAtContext = JsonTemplateFieldContentDynamic.CONTEXT_VERBATIM;
    } else if (field.cedarArtifactType == CedarArtifactType.STATIC_TEMPLATE_FIELD) {
      blueprintAtContext = JsonTemplateFieldContentStatic.CONTEXT_VERBATIM;
    }
    JsonObjectComparator.compareBothWays(parsingResult, blueprintAtContext, topContextNode, path.add(JsonSchema.atContext), this.behavior, [
      JsonSchema.atLanguage,
      ...Object.keys(field.extensions.prefixes),
    ]);

    // Read and validate, but do not store top level type
    // Attribute value requires string, the others object
    if (field.cedarFieldType === CedarFieldType.ATTRIBUTE_VALUE) {
      JsonObjectComparator.comparePrimitive(
        parsingResult,
        JavascriptType.STRING.getValue(),
        ReaderUtil.getString(fieldSourceObject, CedarModel.type),
        path.add(CedarModel.type),
      );
    } else {
      JsonObjectComparator.comparePrimitive(
        parsingResult,
        JavascriptType.OBJECT.getValue(),
        ReaderUtil.getString(fieldSourceObject, CedarModel.type),
        path.add(CedarModel.type),
      );
    }

    // Read and validate, but do not store top level additionalProperties
    JsonObjectComparator.comparePrimitive(
      parsingResult,
      false,
      ReaderUtil.getBoolean(fieldSourceObject, TemplateProperty.additionalProperties),
      path.add(TemplateProperty.additionalProperties),
    );

    // Read and validate, but do not store top level $schema
    JsonObjectComparator.comparePrimitive(
      parsingResult,
      ArtifactSchema.CURRENT.getValue(),
      ReaderUtil.getString(fieldSourceObject, CedarModel.schema),
      path.add(CedarModel.schema),
    );
    field.language = Language.forValue(ReaderUtil.getString(topContextNode, JsonSchema.atLanguage));
  }

  protected static readFieldSpecificAttributes(
    fieldSourceObject: JsonNode,
    childInfo: AbstractChildDeploymentInfo,
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
  ): TemplateField {
    // A type given as a list of one is that type, as in Java.
    const artifactType: CedarArtifactType = JsonArtifactShape.declaredTypeOrNull(fieldSourceObject, path);
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    const rawUiInputType = ReaderUtil.getString(uiNode, CedarModel.inputType);
    const uiInputType: UiInputType = UiInputType.forValue(rawUiInputType);
    const fieldType: CedarFieldType = this.getCedarFieldType(fieldSourceObject, uiInputType);
    if (fieldType === CedarFieldType.NULL) {
      throw new Error(`Unknown uiInputType type: "${rawUiInputType}"`);
    } else {
      if (artifactType == CedarArtifactType.TEMPLATE_FIELD || artifactType == CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        if (uiInputType != null) {
          const reader: JsonTemplateFieldTypeSpecificReader | undefined = this.dynamicTypeReaderMap.get(fieldType);
          if (!reader) {
            throw new Error(`
          No reader defined for dynamic input type "${fieldType.getValue()}"`);
          }
          // Java judges a field's term constraints whatever its kind. The controlled-term reader reads them
          // and holds them to Java's rules itself. Every other kind is held to those rules here and keeps nothing.
          if (fieldType !== CedarFieldType.CONTROLLED_TERM) {
            JsonTermConstraintChecks.assertReadable(fieldSourceObject, path);
          }
          return reader.read(fieldSourceObject, childInfo, parsingResult, path);
        }
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
    // Match Java's hasExplicitConstraints: actions modify a vocabulary selection;
    // stale actions alone must not turn literal text into a controlled-term field.
    return valueSets.length > 0;
  }

  private static getCedarFieldType(fieldSourceObject: JsonNode, uiInputType: UiInputType): CedarFieldType {
    let fieldType: CedarFieldType = CedarFieldType.forUiInputType(uiInputType);
    // The map used in the method will guarantee that TEXT is always returned, but we double-check anyway
    if (fieldType === CedarFieldType.TEXT || fieldType === CedarFieldType.CONTROLLED_TERM) {
      const properties = ReaderUtil.getNode(fieldSourceObject, JsonSchema.properties);
      // An unconstrained IRI-valued textfield is still a controlled-term field.
      // Its instance schema distinguishes it from literal text before a vocabulary is chosen.
      const iriValued =
        Object.prototype.hasOwnProperty.call(properties, JsonSchema.atId) &&
        !Object.prototype.hasOwnProperty.call(properties, JsonSchema.atValue);
      if (iriValued || this.fieldHasValueConstraint(fieldSourceObject)) {
        fieldType = CedarFieldType.CONTROLLED_TERM;
      } else {
        fieldType = CedarFieldType.TEXT;
      }
    }
    return fieldType;
  }
}
