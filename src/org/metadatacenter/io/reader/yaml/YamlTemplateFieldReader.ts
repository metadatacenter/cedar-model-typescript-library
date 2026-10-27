import { YamlSourcePolicy } from './YamlSourcePolicy';
import { YamlKeyTracking } from './YamlKeyTracking';
import { applySchemaReaderDefaults } from '../SchemaReaderDefaults';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { ReaderUtil } from '../ReaderUtil';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { YamlFieldReaderEmail } from '../../../model/cedar/field/dynamic/email/YamlFieldReaderEmail';
import { YamlTemplateFieldReaderResult } from './YamlTemplateFieldReaderResult';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { YamlAbstractArtifactReader } from './YamlAbstractArtifactReader';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlTemplateFieldTypeSpecificReader } from './YamlTemplateFieldTypeSpecificReader';
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
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';
import { YamlFieldReaderExtRor } from '../../../model/cedar/field/dynamic/ext-ror/YamlFieldReaderExtRor';
import { YamlFieldReaderExtOrcid } from '../../../model/cedar/field/dynamic/ext-orcid/YamlFieldReaderExtOrcid';
import { YamlFieldReaderExtPfas } from '../../../model/cedar/field/dynamic/ext-pfas/YamlFieldReaderExtPfas';
import { YamlFieldReaderExtPubmed } from '../../../model/cedar/field/dynamic/ext-pubmed/YamlFieldReaderExtPubmed';
import { YamlFieldReaderExtRrid } from '../../../model/cedar/field/dynamic/ext-rrid/YamlFieldReaderExtRrid';
import { YamlFieldReaderExtNihGrantId } from '../../../model/cedar/field/dynamic/ext-nih-grant-id/YamlFieldReaderExtNihGrantId';
import { YamlFieldReaderExtDoi } from '../../../model/cedar/field/dynamic/ext-doi/YamlFieldReaderExtDoi';
import { ControlledTermFieldImpl } from '../../../model/cedar/field/dynamic/controlled-term/ControlledTermFieldImpl';
import { TextFieldImpl } from '../../../model/cedar/field/dynamic/textfield/TextFieldImpl';

export class YamlTemplateFieldReader extends YamlAbstractArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;

  private constructor(behavior: YamlReaderBehavior, isCompact: boolean = false) {
    super(behavior, isCompact);
  }

  public static getStrict(): YamlTemplateFieldReader {
    return new YamlTemplateFieldReader(YamlReaderBehavior.STRICT);
  }

  /**
   * A reader for the compact form, which omits the model version and the rest of what the system
   * records about an artifact. Asking for it is the only way to read that form.
   */
  public static getStrictForCompact(): YamlTemplateFieldReader {
    return new YamlTemplateFieldReader(YamlReaderBehavior.STRICT, true);
  }

  public static getForBehavior(behavior: YamlReaderBehavior, isCompact: boolean = false): YamlTemplateFieldReader {
    return new YamlTemplateFieldReader(behavior, isCompact);
  }

  static readerMap = new Map<YamlArtifactType, YamlTemplateFieldTypeSpecificReader>([
    [YamlArtifactType.TEXTFIELD, new YamlFieldReaderTextField()],
    [YamlArtifactType.TEXTAREA, new YamlFieldReaderTextArea()],
    [YamlArtifactType.CONTROLLED_TERM, new YamlFieldReaderControlledTerm()],
    [YamlArtifactType.LINK, new YamlFieldReaderLink()],
    [YamlArtifactType.EXT_ROR, new YamlFieldReaderExtRor()],
    [YamlArtifactType.EXT_ORCID, new YamlFieldReaderExtOrcid()],
    [YamlArtifactType.EXT_PFAS, new YamlFieldReaderExtPfas()],
    [YamlArtifactType.EXT_PUBMED, new YamlFieldReaderExtPubmed()],
    [YamlArtifactType.EXT_RRID, new YamlFieldReaderExtRrid()],
    [YamlArtifactType.EXT_NIH_GRANT_ID, new YamlFieldReaderExtNihGrantId()],
    [YamlArtifactType.EXT_DOI, new YamlFieldReaderExtDoi()],
    [YamlArtifactType.TEMPORAL, new YamlFieldReaderTemporal()],
    [YamlArtifactType.EMAIL, new YamlFieldReaderEmail()],
    [YamlArtifactType.NUMERIC, new YamlFieldReaderNumeric()],
    [YamlArtifactType.PHONE_NUMBER, new YamlFieldReaderPhoneNumber()],
    [YamlArtifactType.RADIO, new YamlFieldReaderRadio()],
    [YamlArtifactType.CHECKBOX, new YamlFieldReaderCheckbox()],
    [YamlArtifactType.SINGLE_SELECT_LIST, new YamlFieldReaderSingleSelectList()],
    [YamlArtifactType.MULTI_SELECT_LIST, new YamlFieldReaderMultiSelectList()],
    [YamlArtifactType.ATTRIBUTE_VALUE, new YamlFieldReaderAttributeValue()],
    [YamlArtifactType.PAGE_BREAK, new YamlFieldReaderPageBreak()],
    [YamlArtifactType.SECTION_BREAK, new YamlFieldReaderSectionBreak()],
    [YamlArtifactType.IMAGE, new YamlFieldReaderImage()],
    [YamlArtifactType.RICH_TEXT, new YamlFieldReaderRichText()],
    [YamlArtifactType.YOUTUBE, new YamlFieldReaderYoutube()],
  ]);

  public readFromString(fieldSourceString: string): YamlTemplateFieldReaderResult {
    const fieldObject = YamlSourcePolicy.parse(fieldSourceString);
    return this.readFromObject(fieldObject, ChildDeploymentInfo.empty(), new JsonPath());
  }

  public readFromObject(sourceObject: JsonNode, childInfo: ChildDeploymentInfo, path: JsonPath): YamlTemplateFieldReaderResult {
    return YamlKeyTracking.read(sourceObject, path.toPointer(), (fieldSourceObject) => {
      // A child is part of a document whose walk has already reached it.
      if (path.getLastComponent() === null) {
        YamlTemplateFieldReader.refuseNullAndEmptySchemaValues(fieldSourceObject, path);
      }
      const parsingResult: YamlArtifactParsingResult = new YamlArtifactParsingResult();
      const field: TemplateField = YamlTemplateFieldReader.readFieldSpecificAttributes(fieldSourceObject, childInfo, parsingResult, path);
      this.assertSchemaMetadata(fieldSourceObject, path);
      // A child's `id` may be a temporary one the server replaces on a write.
      if (path.getLastComponent() === null) {
        ReaderUtil.getIdentifier(fieldSourceObject, YamlKeys.id);
      }
      this.readNonReportableAttributes(field, fieldSourceObject, path.getLastComponent() === null);
      applySchemaReaderDefaults(field, fieldSourceObject, path, 'yaml');
      this.readAnnotations(field, fieldSourceObject, parsingResult, path);
      return new YamlTemplateFieldReaderResult(field, parsingResult, sourceObject);
    });
  }

  protected readNonReportableAttributes(field: TemplateField, fieldSourceObject: JsonNode, isDocumentRoot: boolean = false) {
    super.readNonReportableAttributes(field, fieldSourceObject);
    // Read field-specific nodes
    field.skos_prefLabel = ReaderUtil.getString(fieldSourceObject, YamlKeys.prefLabel);
    field.skos_altLabel = YamlTemplateFieldReader.readAltLabels(fieldSourceObject);
    // A field's own presentation settings sit among its keys, and a child's may also sit in its
    // configuration, as in Java's reader. A configuration is what a parent says of its child,
    // whether it is required or recommended among it, so a field written on its own has none and
    // is neither, and a document stating one for it is refused.
    const configuration: JsonNode = isDocumentRoot ? JsonNode.getEmpty() : ReaderUtil.getNode(fieldSourceObject, YamlKeys.configuration);
    if (field instanceof ControlledTermFieldImpl || field instanceof TextFieldImpl) {
      field.valueRecommendationEnabled = ReaderUtil.getBoolean(fieldSourceObject, YamlKeys.valueRecommendation);
    }
    field.hidden = YamlTemplateFieldReader.readFlag(configuration, fieldSourceObject, YamlKeys.hidden);
    field.continuePreviousLine = YamlTemplateFieldReader.readFlag(configuration, fieldSourceObject, YamlKeys.continuePreviousLine);
    field.requiredValue = !isDocumentRoot && YamlTemplateFieldReader.readFlag(configuration, fieldSourceObject, YamlKeys.required);
    field.recommendedValue = !isDocumentRoot && YamlTemplateFieldReader.readFlag(configuration, fieldSourceObject, YamlKeys.recommended);
  }

  /**
   * A flag the document may state in its `configuration` block or at the field's own level. Both
   * are read, and where both state it the `configuration` block's is taken, as in Java's reader.
   */
  private static readFlag(configuration: JsonNode, fieldSourceObject: JsonNode, key: string): boolean {
    const configured = ReaderUtil.getBoolean(configuration, key);
    const own = ReaderUtil.getBoolean(fieldSourceObject, key);
    return Object.hasOwn(configuration, key) ? configured : own;
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

    // A type this library does not know is not a field it can carry. Returning a typeless field
    // instead reported success and left the artifact holding something no writer can write, so the
    // failure surfaced later and somewhere else. The Java library refuses the same input here.
    throw new Error(`Unknown field type "${ReaderUtil.getString(fieldSourceObject, YamlKeys.type)}" at ${path.toString()}`);
  }
}
