import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { JsonAtomicWriter } from './JsonAtomicWriter';
import { JsonTemplateFieldWriterInternal } from './JsonTemplateFieldWriterInternal';
import { JsonTemplateWriter } from './JsonTemplateWriter';
import { CedarFieldType } from '../../../model/cedar/types/cedar-types/CedarFieldType';
import { JsonFieldWriterTextField } from '../../../model/cedar/field/dynamic/textfield/JsonFieldWriterTextField';
import { JsonFieldWriterLink } from '../../../model/cedar/field/dynamic/link/JsonFieldWriterLink';
import { JsonFieldWriterNumeric } from '../../../model/cedar/field/dynamic/numeric/JsonFieldWriterNumeric';
import { JsonFieldWriterTemporal } from '../../../model/cedar/field/dynamic/temporal/JsonFieldWriterTemporal';
import { JsonFieldWriterStaticImage } from '../../../model/cedar/field/static/image/JsonFieldWriterStaticImage';
import { JsonFieldWriterStaticPageBreak } from '../../../model/cedar/field/static/page-break/JsonFieldWriterStaticPageBreak';
import { JsonFieldWriterStaticSectionsBreak } from '../../../model/cedar/field/static/section-break/JsonFieldWriterStaticSectionBreak';
import { JsonFieldWriterStaticRichText } from '../../../model/cedar/field/static/rich-text/JsonFieldWriterStaticRichText';
import { JsonFieldWriterStaticYoutube } from '../../../model/cedar/field/static/youtube/JsonFieldWriterStaticYoutube';
import { JsonFieldWriterRadio } from '../../../model/cedar/field/dynamic/radio/JsonFieldWriterRadio';
import { JsonFieldWriterCheckbox } from '../../../model/cedar/field/dynamic/checkbox/JsonFieldWriterCheckbox';
import { JsonFieldWriterList } from '../../../model/cedar/field/dynamic/list/JsonFieldWriterList';
import { JsonFieldWriterTextArea } from '../../../model/cedar/field/dynamic/textarea/JsonFieldWriterTextArea';
import { JsonFieldWriterPhoneNumber } from '../../../model/cedar/field/dynamic/phone-number/JsonFieldWriterPhoneNumber';
import { JsonFieldWriterEmail } from '../../../model/cedar/field/dynamic/email/JsonFieldWriterEmail';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { JsonFieldWriterAttributeValue } from '../../../model/cedar/field/dynamic/attribute-value/JsonFieldWriterAttributeValue';
import { JsonFieldWriterControlledTerm } from '../../../model/cedar/field/dynamic/controlled-term/JsonFieldWriterControlledTerm';
import { ControlledTermOntology } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/ontology/ControlledTermOntology';
import { JsonValueConstraintsOntologyWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/ontology/JsonValueConstraintsOntologyWriter';
import { AbstractJsonControlledTermValueConstraintWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/AbstractJsonControlledTermValueConstraintWriter';
import { ControlledTermAbstractValueConstraint } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/ControlledTermAbstractValueConstraint';
import { ControlledTermClass } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/class/ControlledTermClass';
import { JsonValueConstraintsClassWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/class/JsonValueConstraintsClassWriter';
import { ControlledTermBranch } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/branch/ControlledTermBranch';
import { JsonValueConstraintsBranchWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/branch/JsonValueConstraintsBranchWriter';
import { ControlledTermValueSet } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/value-set/ControlledTermValueSet';
import { JsonValueConstraintsValueSetWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/value-set/JsonValueConstraintsValueSetWriter';
import { JsonTemplateElementWriter } from './JsonTemplateElementWriter';
import { JsonAnnotationsWriter } from './JsonAnnotationsWriter';
import { ControlledTermAction } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/action/ControlledTermAction';
import { JsonValueConstraintsActionWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/action/JsonValueConstraintsActionWriter';
import { JsonAbstractArtifactWriter } from './JsonAbstractArtifactWriter';
import { Template } from '../../../model/cedar/template/Template';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { AbstractArtifact } from '../../../model/cedar/AbstractArtifact';

export class CedarJsonWriters {
  private readonly behavior: JsonWriterBehavior;
  private readonly jsonDynamicFieldWriters: Map<CedarFieldType, JsonTemplateFieldWriterInternal>;
  private readonly jsonStaticFieldWriters: Map<CedarFieldType, JsonTemplateFieldWriterInternal>;
  private readonly jsonValueConstraintsWriters: Map<string, AbstractJsonControlledTermValueConstraintWriter>;
  private readonly jsonAtomicWriter: JsonAtomicWriter;
  private readonly jsonAnnotationsWriter: JsonAnnotationsWriter;
  private readonly jsonTemplateWriter: JsonTemplateWriter;
  private readonly jsonTemplateElementWriter: JsonTemplateElementWriter;

  private constructor(behavior: JsonWriterBehavior) {
    this.behavior = behavior;
    // JSON writers. Order is important
    this.jsonAtomicWriter = new JsonAtomicWriter(behavior);
    this.jsonAnnotationsWriter = new JsonAnnotationsWriter(behavior);
    this.jsonTemplateWriter = JsonTemplateWriter.getFor(behavior, this);
    this.jsonTemplateElementWriter = JsonTemplateElementWriter.getFor(behavior, this);

    this.jsonDynamicFieldWriters = new Map<CedarFieldType, JsonTemplateFieldWriterInternal>([
      [CedarFieldType.TEXT, new JsonFieldWriterTextField(behavior, this)],
      [CedarFieldType.TEXTAREA, new JsonFieldWriterTextArea(behavior, this)],
      [CedarFieldType.CONTROLLED_TERM, new JsonFieldWriterControlledTerm(behavior, this)],
      [CedarFieldType.PHONE_NUMBER, new JsonFieldWriterPhoneNumber(behavior, this)],
      [CedarFieldType.EMAIL, new JsonFieldWriterEmail(behavior, this)],
      [CedarFieldType.LINK, new JsonFieldWriterLink(behavior, this)],
      [CedarFieldType.NUMERIC, new JsonFieldWriterNumeric(behavior, this)],
      [CedarFieldType.TEMPORAL, new JsonFieldWriterTemporal(behavior, this)],
      [CedarFieldType.RADIO, new JsonFieldWriterRadio(behavior, this)],
      [CedarFieldType.CHECKBOX, new JsonFieldWriterCheckbox(behavior, this)],
      [CedarFieldType.SINGLE_SELECT_LIST, new JsonFieldWriterList(behavior, this)],
      [CedarFieldType.MULTIPLE_SELECT_LIST, new JsonFieldWriterList(behavior, this)],
      [CedarFieldType.ATTRIBUTE_VALUE, new JsonFieldWriterAttributeValue(behavior, this)],
    ]);

    this.jsonStaticFieldWriters = new Map<CedarFieldType, JsonTemplateFieldWriterInternal>([
      [CedarFieldType.STATIC_PAGE_BREAK, new JsonFieldWriterStaticPageBreak(behavior, this)],
      [CedarFieldType.STATIC_SECTION_BREAK, new JsonFieldWriterStaticSectionsBreak(behavior, this)],
      [CedarFieldType.STATIC_IMAGE, new JsonFieldWriterStaticImage(behavior, this)],
      [CedarFieldType.STATIC_RICH_TEXT, new JsonFieldWriterStaticRichText(behavior, this)],
      [CedarFieldType.STATIC_YOUTUBE, new JsonFieldWriterStaticYoutube(behavior, this)],
    ]);

    this.jsonValueConstraintsWriters = new Map<string, AbstractJsonControlledTermValueConstraintWriter>([
      [ControlledTermOntology.className, new JsonValueConstraintsOntologyWriter(behavior, this)],
      [ControlledTermClass.className, new JsonValueConstraintsClassWriter(behavior, this)],
      [ControlledTermBranch.className, new JsonValueConstraintsBranchWriter(behavior, this)],
      [ControlledTermValueSet.className, new JsonValueConstraintsValueSetWriter(behavior, this)],
      [ControlledTermAction.className, new JsonValueConstraintsActionWriter(behavior, this)],
    ]);
  }

  public static getStrict(): CedarJsonWriters {
    return new CedarJsonWriters(JsonWriterBehavior.STRICT);
  }

  public static getFebruary2024(): CedarJsonWriters {
    return new CedarJsonWriters(JsonWriterBehavior.FEBRUARY_2024);
  }

  public static getFor(behavior: JsonWriterBehavior): CedarJsonWriters {
    return new CedarJsonWriters(behavior);
  }

  public getTemplateWriter(): JsonTemplateWriter {
    return this.jsonTemplateWriter;
  }

  public getTemplateElementWriter(): JsonTemplateElementWriter {
    return this.jsonTemplateElementWriter;
  }

  public getAtomicWriter() {
    return this.jsonAtomicWriter;
  }

  public getFieldWriterForType(cedarFieldType: CedarFieldType): JsonTemplateFieldWriterInternal {
    let writer: JsonTemplateFieldWriterInternal | undefined;
    if (cedarFieldType.isStaticField) {
      writer = this.jsonStaticFieldWriters.get(cedarFieldType);
    } else {
      writer = this.jsonDynamicFieldWriters.get(cedarFieldType);
    }
    if (writer) {
      return writer;
    }
    throw new Error(`No JSON writer found for field type: ${cedarFieldType.getValue()}`);
  }

  public getWriterForValueConstraint(object: ControlledTermAbstractValueConstraint): AbstractJsonControlledTermValueConstraintWriter {
    const className = object.className;
    const writer = this.jsonValueConstraintsWriters.get(className);
    if (writer) {
      return writer;
    }
    throw new Error(`No JSON writer found for class type: ${className}`);
  }

  public getFieldWriterForField(field: TemplateField): JsonTemplateFieldWriterInternal {
    return this.getFieldWriterForType(field.cedarFieldType);
  }

  getAnnotationsWriter(): JsonAnnotationsWriter {
    return this.jsonAnnotationsWriter;
  }

  public getWriterForArtifact(cedarArtifact: AbstractArtifact): JsonAbstractArtifactWriter {
    if (cedarArtifact instanceof Template) {
      return JsonTemplateWriter.getFor(this.behavior, this);
    } else if (cedarArtifact instanceof TemplateElement) {
      return JsonTemplateElementWriter.getFor(this.behavior, this);
    } else if (cedarArtifact instanceof TemplateField) {
      return this.getFieldWriterForType(cedarArtifact.cedarFieldType);
    }
    throw new Error(`No JSON reader available for CedarArtifact: ${cedarArtifact}`);
  }
}
