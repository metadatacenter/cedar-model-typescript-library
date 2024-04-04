import { CedarFieldType } from '../../../model/cedar/types/cedar-types/CedarFieldType';
import { YAMLTemplateWriter } from './YAMLTemplateWriter';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { ControlledTermOntology } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/ontology/ControlledTermOntology';
import { ControlledTermAbstractValueConstraint } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/ControlledTermAbstractValueConstraint';
import { ControlledTermClass } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/class/ControlledTermClass';
import { ControlledTermBranch } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/branch/ControlledTermBranch';
import { ControlledTermValueSet } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/value-set/ControlledTermValueSet';
import { ControlledTermAction } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/action/ControlledTermAction';
import { YAMLTemplateFieldWriterInternal } from './YAMLTemplateFieldWriterInternal';
import { YAMLFieldWriterTextField } from '../../../model/cedar/field/dynamic/textfield/YAMLFieldWriterTextField';
import { YAMLAtomicWriter } from './YAMLAtomicWriter';
import { YAMLAnnotationsWriter } from './YAMLAnnotationsWriter';
import { YAMLFieldWriterTextArea } from '../../../model/cedar/field/dynamic/textarea/YAMLFieldWriterTextArea';
import { YAMLFieldWriterTemporal } from '../../../model/cedar/field/dynamic/temporal/YAMLFieldWriterTemporal';
import { YAMLFieldWriterStaticPageBreak } from '../../../model/cedar/field/static/page-break/YAMLFieldWriterStaticPageBreak';
import { YAMLFieldWriterLink } from '../../../model/cedar/field/dynamic/link/YAMLFieldWriterLink';
import { YAMLFieldWriterStaticSectionsBreak } from '../../../model/cedar/field/static/section-break/YAMLFieldWriterStaticSectionBreak';
import { YAMLFieldWriterStaticImage } from '../../../model/cedar/field/static/image/YAMLFieldWriterStaticImage';
import { YAMLFieldWriterStaticRichText } from '../../../model/cedar/field/static/rich-text/YAMLFieldWriterStaticRichText';
import { YAMLFieldWriterStaticYoutube } from '../../../model/cedar/field/static/youtube/YAMLFieldWriterStaticYoutube';
import { YAMLTemplateElementWriter } from './YAMLTemplateElementWriter';
import { YAMLFieldWriterAttributeValue } from '../../../model/cedar/field/dynamic/attribute-value/YAMLFieldWriterAttributeValue';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/AbstractYAMLControlledTermValueConstraintWriter';
import { YAMLFieldWriterEmail } from '../../../model/cedar/field/dynamic/email/YAMLFieldWriterEmail';
import { YAMLFieldWriterNumeric } from '../../../model/cedar/field/dynamic/numeric/YAMLFieldWriterNumeric';
import { YAMLFieldWriterPhoneNumber } from '../../../model/cedar/field/dynamic/phone-number/YAMLFieldWriterPhoneNumber';
import { YAMLFieldWriterCheckbox } from '../../../model/cedar/field/dynamic/checkbox/YAMLFieldWriterCheckbox';
import { YAMLFieldWriterList } from '../../../model/cedar/field/dynamic/list/YAMLFieldWriterList';
import { YAMLFieldWriterRadio } from '../../../model/cedar/field/dynamic/radio/YAMLFieldWriterRadio';
import { YAMLFieldWriterControlledTerm } from '../../../model/cedar/field/dynamic/controlled-term/YAMLFieldWriterControlledTerm';
import { YAMLValueConstraintsOntologyWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/ontology/YAMLValueConstraintsOntologyWriter';
import { YAMLValueConstraintsClassWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/class/YAMLValueConstraintsClassWriter';
import { YAMLValueConstraintsBranchWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/branch/YAMLValueConstraintsBranchWriter';
import { YAMLValueConstraintsValueSetWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/value-set/YAMLValueConstraintsValueSetWriter';
import { YAMLValueConstraintsActionWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/action/YAMLValueConstraintsActionWriter';
import { YAMLWriterBehavior } from '../../../behavior/YAMLWriterBehavior';

export class CedarYAMLWriters {
  private readonly behavior: YAMLWriterBehavior;
  private readonly yamlDynamicFieldWriters: Map<CedarFieldType, YAMLTemplateFieldWriterInternal>;
  private readonly yamlStaticFieldWriters: Map<CedarFieldType, YAMLTemplateFieldWriterInternal>;
  private readonly yamlValueConstraintsWriters: Map<string, AbstractYAMLControlledTermValueConstraintWriter>;
  private readonly yamlAtomicWriter: YAMLAtomicWriter;
  private readonly yamlAnnotationsWriter: YAMLAnnotationsWriter;
  private readonly yamlTemplateWriter: YAMLTemplateWriter;
  private readonly yamlTemplateElementWriter: YAMLTemplateElementWriter;

  private constructor(behavior: YAMLWriterBehavior) {
    this.behavior = behavior;
    // YAML writers. Order is important
    this.yamlAtomicWriter = new YAMLAtomicWriter(behavior);
    this.yamlAnnotationsWriter = new YAMLAnnotationsWriter(behavior);
    this.yamlTemplateWriter = YAMLTemplateWriter.getFor(behavior, this);
    this.yamlTemplateElementWriter = YAMLTemplateElementWriter.getFor(behavior, this);

    this.yamlDynamicFieldWriters = new Map<CedarFieldType, YAMLTemplateFieldWriterInternal>([
      [CedarFieldType.TEXT, new YAMLFieldWriterTextField(behavior, this)],
      [CedarFieldType.TEXTAREA, new YAMLFieldWriterTextArea(behavior, this)],
      [CedarFieldType.CONTROLLED_TERM, new YAMLFieldWriterControlledTerm(behavior, this)],
      [CedarFieldType.PHONE_NUMBER, new YAMLFieldWriterPhoneNumber(behavior, this)],
      [CedarFieldType.EMAIL, new YAMLFieldWriterEmail(behavior, this)],
      [CedarFieldType.LINK, new YAMLFieldWriterLink(behavior, this)],
      [CedarFieldType.NUMERIC, new YAMLFieldWriterNumeric(behavior, this)],
      [CedarFieldType.TEMPORAL, new YAMLFieldWriterTemporal(behavior, this)],
      [CedarFieldType.RADIO, new YAMLFieldWriterRadio(behavior, this)],
      [CedarFieldType.CHECKBOX, new YAMLFieldWriterCheckbox(behavior, this)],
      [CedarFieldType.LIST, new YAMLFieldWriterList(behavior, this)],
      [CedarFieldType.ATTRIBUTE_VALUE, new YAMLFieldWriterAttributeValue(behavior, this)],
    ]);

    this.yamlStaticFieldWriters = new Map<CedarFieldType, YAMLTemplateFieldWriterInternal>([
      [CedarFieldType.STATIC_PAGE_BREAK, new YAMLFieldWriterStaticPageBreak(behavior, this)],
      [CedarFieldType.STATIC_SECTION_BREAK, new YAMLFieldWriterStaticSectionsBreak(behavior, this)],
      [CedarFieldType.STATIC_IMAGE, new YAMLFieldWriterStaticImage(behavior, this)],
      [CedarFieldType.STATIC_RICH_TEXT, new YAMLFieldWriterStaticRichText(behavior, this)],
      [CedarFieldType.STATIC_YOUTUBE, new YAMLFieldWriterStaticYoutube(behavior, this)],
    ]);

    this.yamlValueConstraintsWriters = new Map<string, AbstractYAMLControlledTermValueConstraintWriter>([
      [ControlledTermOntology.className, new YAMLValueConstraintsOntologyWriter(behavior, this)],
      [ControlledTermClass.className, new YAMLValueConstraintsClassWriter(behavior, this)],
      [ControlledTermBranch.className, new YAMLValueConstraintsBranchWriter(behavior, this)],
      [ControlledTermValueSet.className, new YAMLValueConstraintsValueSetWriter(behavior, this)],
      [ControlledTermAction.className, new YAMLValueConstraintsActionWriter(behavior, this)],
    ]);
  }

  public static getStrict(): CedarYAMLWriters {
    return new CedarYAMLWriters(YAMLWriterBehavior.STRICT);
  }

  public static getFor(behavior: YAMLWriterBehavior): CedarYAMLWriters {
    return new CedarYAMLWriters(behavior);
  }

  public getYAMLFieldWriterForType(cedarFieldType: CedarFieldType): YAMLTemplateFieldWriterInternal {
    let writer: YAMLTemplateFieldWriterInternal | undefined;
    if (cedarFieldType.isStaticField) {
      writer = this.yamlStaticFieldWriters.get(cedarFieldType);
    } else {
      writer = this.yamlDynamicFieldWriters.get(cedarFieldType);
    }
    if (writer) {
      return writer;
    }
    throw new Error(`No YAML writer found for field type: ${cedarFieldType.getValue()}`);
  }

  public getYAMLFieldWriterForField(field: TemplateField): YAMLTemplateFieldWriterInternal {
    return this.getYAMLFieldWriterForType(field.cedarFieldType);
  }

  getYAMLAtomicWriter(): YAMLAtomicWriter {
    return this.yamlAtomicWriter;
  }

  getYAMLAnnotationsWriter(): YAMLAnnotationsWriter {
    return this.yamlAnnotationsWriter;
  }

  getYAMLTemplateWriter(): YAMLTemplateWriter {
    return this.yamlTemplateWriter;
  }

  getYAMLTemplateElementWriter(): YAMLTemplateElementWriter {
    return this.yamlTemplateElementWriter;
  }

  public getYAMLWriterForValueConstraint(object: ControlledTermAbstractValueConstraint): AbstractYAMLControlledTermValueConstraintWriter {
    const className = object.className;
    const writer = this.yamlValueConstraintsWriters.get(className);
    if (writer) {
      return writer;
    }
    throw new Error(`No YAML writer found for class type: ${className}`);
  }
}
