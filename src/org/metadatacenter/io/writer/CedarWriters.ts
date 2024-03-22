import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { JSONAtomicWriter } from './JSONAtomicWriter';
import { JSONTemplateFieldWriterInternal } from './JSONTemplateFieldWriterInternal';
import { JSONTemplateWriter } from './JSONTemplateWriter';
import { CedarFieldType } from '../../model/cedar/types/cedar-types/CedarFieldType';
import { JSONFieldWriterTextField } from '../../model/cedar/field/dynamic/textfield/JSONFieldWriterTextField';
import { JSONFieldWriterLink } from '../../model/cedar/field/dynamic/link/JSONFieldWriterLink';
import { JSONFieldWriterNumeric } from '../../model/cedar/field/dynamic/numeric/JSONFieldWriterNumeric';
import { JSONFieldWriterTemporal } from '../../model/cedar/field/dynamic/temporal/JSONFieldWriterTemporal';
import { JSONFieldWriterStaticImage } from '../../model/cedar/field/static/image/JSONFieldWriterStaticImage';
import { JSONFieldWriterStaticPageBreak } from '../../model/cedar/field/static/page-break/JSONFieldWriterStaticPageBreak';
import { JSONFieldWriterStaticSectionsBreak } from '../../model/cedar/field/static/section-break/JSONFieldWriterStaticSectionBreak';
import { JSONFieldWriterStaticRichText } from '../../model/cedar/field/static/rich-text/JSONFieldWriterStaticRichText';
import { JSONFieldWriterStaticYoutube } from '../../model/cedar/field/static/youtube/JSONFieldWriterStaticYoutube';
import { JSONFieldWriterRadio } from '../../model/cedar/field/dynamic/radio/JSONFieldWriterRadio';
import { JSONFieldWriterCheckbox } from '../../model/cedar/field/dynamic/checkbox/JSONFieldWriterCheckbox';
import { YAMLTemplateWriter } from './YAMLTemplateWriter';
import { JSONFieldWriterList } from '../../model/cedar/field/dynamic/list/JSONFieldWriterList';
import { JSONFieldWriterTextArea } from '../../model/cedar/field/dynamic/textarea/JSONFieldWriterTextArea';
import { JSONFieldWriterPhoneNumber } from '../../model/cedar/field/dynamic/phone-number/JSONFieldWriterPhoneNumber';
import { JSONFieldWriterEmail } from '../../model/cedar/field/dynamic/email/JSONFieldWriterEmail';
import { TemplateField } from '../../model/cedar/field/TemplateField';
import { JSONFieldWriterAttributeValue } from '../../model/cedar/field/dynamic/attribute-value/JSONFieldWriterAttributeValue';
import { JSONFieldWriterControlledTerm } from '../../model/cedar/field/dynamic/controlled-term/JSONFieldWriterControlledTerm';
import { ControlledTermOntology } from '../../model/cedar/field/dynamic/controlled-term/value-constraint/ontology/ControlledTermOntology';
import { JSONValueConstraintsOntologyWriter } from '../../model/cedar/field/dynamic/controlled-term/value-constraint/ontology/JSONValueConstraintsOntologyWriter';
import { AbstractJSONControlledTermValueConstraintWriter } from '../../model/cedar/field/dynamic/controlled-term/value-constraint/AbstractJSONControlledTermValueConstraintWriter';
import { ControlledTermAbstractValueConstraint } from '../../model/cedar/field/dynamic/controlled-term/value-constraint/ControlledTermAbstractValueConstraint';
import { ControlledTermClass } from '../../model/cedar/field/dynamic/controlled-term/value-constraint/class/ControlledTermClass';
import { JSONValueConstraintsClassWriter } from '../../model/cedar/field/dynamic/controlled-term/value-constraint/class/JSONValueConstraintsClassWriter';
import { ControlledTermBranch } from '../../model/cedar/field/dynamic/controlled-term/value-constraint/branch/ControlledTermBranch';
import { JSONValueConstraintsBranchWriter } from '../../model/cedar/field/dynamic/controlled-term/value-constraint/branch/JSONValueConstraintsBranchWriter';
import { ControlledTermValueSet } from '../../model/cedar/field/dynamic/controlled-term/value-constraint/value-set/ControlledTermValueSet';
import { JSONValueConstraintsValueSetWriter } from '../../model/cedar/field/dynamic/controlled-term/value-constraint/value-set/JSONValueConstraintsValueSetWriter';
import { JSONTemplateElementWriter } from './JSONTemplateElementWriter';

export class CedarWriters {
  private readonly behavior: JSONWriterBehavior;
  private readonly dynamicFieldWriters: Map<CedarFieldType, JSONTemplateFieldWriterInternal>;
  private readonly staticFieldWriters: Map<CedarFieldType, JSONTemplateFieldWriterInternal>;
  private readonly valueConstraintsWriters: Map<string, AbstractJSONControlledTermValueConstraintWriter>;
  private readonly jsonAtomicWriter: JSONAtomicWriter;
  private readonly jsonTemplateWriter: JSONTemplateWriter;
  private readonly jsonTemplateElementWriter: JSONTemplateElementWriter;
  private readonly yamlTemplateWriter: YAMLTemplateWriter;

  private constructor(behavior: JSONWriterBehavior) {
    this.behavior = behavior;
    this.jsonAtomicWriter = new JSONAtomicWriter(behavior);
    this.jsonTemplateWriter = JSONTemplateWriter.getFor(behavior, this);
    this.jsonTemplateElementWriter = JSONTemplateElementWriter.getFor(behavior, this);
    this.yamlTemplateWriter = YAMLTemplateWriter.getFor(behavior, this);

    this.dynamicFieldWriters = new Map<CedarFieldType, JSONTemplateFieldWriterInternal>([
      [CedarFieldType.TEXT, new JSONFieldWriterTextField(behavior, this)],
      [CedarFieldType.TEXTAREA, new JSONFieldWriterTextArea(behavior, this)],
      [CedarFieldType.CONTROLLED_TERM, new JSONFieldWriterControlledTerm(behavior, this)],
      [CedarFieldType.PHONE_NUMBER, new JSONFieldWriterPhoneNumber(behavior, this)],
      [CedarFieldType.EMAIL, new JSONFieldWriterEmail(behavior, this)],
      [CedarFieldType.LINK, new JSONFieldWriterLink(behavior, this)],
      [CedarFieldType.NUMERIC, new JSONFieldWriterNumeric(behavior, this)],
      [CedarFieldType.TEMPORAL, new JSONFieldWriterTemporal(behavior, this)],
      [CedarFieldType.RADIO, new JSONFieldWriterRadio(behavior, this)],
      [CedarFieldType.CHECKBOX, new JSONFieldWriterCheckbox(behavior, this)],
      [CedarFieldType.LIST, new JSONFieldWriterList(behavior, this)],
      [CedarFieldType.ATTRIBUTE_VALUE, new JSONFieldWriterAttributeValue(behavior, this)],
    ]);

    this.staticFieldWriters = new Map<CedarFieldType, JSONTemplateFieldWriterInternal>([
      [CedarFieldType.STATIC_PAGE_BREAK, new JSONFieldWriterStaticPageBreak(behavior, this)],
      [CedarFieldType.STATIC_SECTION_BREAK, new JSONFieldWriterStaticSectionsBreak(behavior, this)],
      [CedarFieldType.STATIC_IMAGE, new JSONFieldWriterStaticImage(behavior, this)],
      [CedarFieldType.STATIC_RICH_TEXT, new JSONFieldWriterStaticRichText(behavior, this)],
      [CedarFieldType.STATIC_YOUTUBE, new JSONFieldWriterStaticYoutube(behavior, this)],
    ]);

    this.valueConstraintsWriters = new Map<string, AbstractJSONControlledTermValueConstraintWriter>([
      [ControlledTermOntology.className, new JSONValueConstraintsOntologyWriter(behavior, this)],
      [ControlledTermClass.className, new JSONValueConstraintsClassWriter(behavior, this)],
      [ControlledTermBranch.className, new JSONValueConstraintsBranchWriter(behavior, this)],
      [ControlledTermValueSet.className, new JSONValueConstraintsValueSetWriter(behavior, this)],
    ]);
  }

  public static getStrict(): CedarWriters {
    return new CedarWriters(JSONWriterBehavior.STRICT);
  }

  public static getFebruary2024(): CedarWriters {
    return new CedarWriters(JSONWriterBehavior.FEBRUARY_2024);
  }

  public static getFor(behavior: JSONWriterBehavior): CedarWriters {
    return new CedarWriters(behavior);
  }

  public getJSONTemplateWriter(): JSONTemplateWriter {
    return this.jsonTemplateWriter;
  }

  public getJSONTemplateElementWriter(): JSONTemplateElementWriter {
    return this.jsonTemplateElementWriter;
  }

  public getJSONAtomicWriter() {
    return this.jsonAtomicWriter;
  }

  public getJSONFieldWriterForType(cedarFieldType: CedarFieldType): JSONTemplateFieldWriterInternal {
    let writer: JSONTemplateFieldWriterInternal | undefined;
    if (cedarFieldType.isStaticField) {
      writer = this.staticFieldWriters.get(cedarFieldType);
    } else {
      writer = this.dynamicFieldWriters.get(cedarFieldType);
    }
    if (writer) {
      return writer;
    }
    throw new Error(`No writer found for field type: ${cedarFieldType.getValue()}`);
  }

  // public getYAMLTemplateWriter(): YAMLTemplateWriter {
  //   return this.yamlTemplateWriter;
  // }

  public getJSONWriterForValueConstraint(object: ControlledTermAbstractValueConstraint): AbstractJSONControlledTermValueConstraintWriter {
    const className = object.className;
    const writer = this.valueConstraintsWriters.get(className);
    if (writer) {
      return writer;
    }
    throw new Error(`No writer found for class type: ${className}`);
  }

  public getJSONFieldWriterForField(field: TemplateField): JSONTemplateFieldWriterInternal {
    return this.getJSONFieldWriterForType(field.cedarFieldType);
  }
}
