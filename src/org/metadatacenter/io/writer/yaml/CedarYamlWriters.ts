import { CedarFieldType } from '../../../model/cedar/types/cedar-types/CedarFieldType';
import { YamlTemplateWriter } from './YamlTemplateWriter';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { ControlledTermOntology } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/ontology/ControlledTermOntology';
import { ControlledTermAbstractValueConstraint } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/ControlledTermAbstractValueConstraint';
import { ControlledTermClass } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/class/ControlledTermClass';
import { ControlledTermBranch } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/branch/ControlledTermBranch';
import { ControlledTermValueSet } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/value-set/ControlledTermValueSet';
import { ControlledTermAction } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/action/ControlledTermAction';
import { YamlTemplateFieldWriterInternal } from './YamlTemplateFieldWriterInternal';
import { YamlFieldWriterTextField } from '../../../model/cedar/field/dynamic/textfield/YamlFieldWriterTextField';
import { YamlAtomicWriter } from './YamlAtomicWriter';
import { YamlAnnotationsWriter } from './YamlAnnotationsWriter';
import { YamlFieldWriterTextArea } from '../../../model/cedar/field/dynamic/textarea/YamlFieldWriterTextArea';
import { YamlFieldWriterTemporal } from '../../../model/cedar/field/dynamic/temporal/YamlFieldWriterTemporal';
import { YamlFieldWriterStaticPageBreak } from '../../../model/cedar/field/static/page-break/YamlFieldWriterStaticPageBreak';
import { YamlFieldWriterLink } from '../../../model/cedar/field/dynamic/link/YamlFieldWriterLink';
import { YAMLFieldWriterStaticSectionsBreak } from '../../../model/cedar/field/static/section-break/YamlFieldWriterStaticSectionBreak';
import { YamlFieldWriterStaticImage } from '../../../model/cedar/field/static/image/YamlFieldWriterStaticImage';
import { YamlFieldWriterStaticRichText } from '../../../model/cedar/field/static/rich-text/YamlFieldWriterStaticRichText';
import { YamlFieldWriterStaticYoutube } from '../../../model/cedar/field/static/youtube/YamlFieldWriterStaticYoutube';
import { YamlTemplateElementWriter } from './YamlTemplateElementWriter';
import { YamlFieldWriterAttributeValue } from '../../../model/cedar/field/dynamic/attribute-value/YamlFieldWriterAttributeValue';
import { AbstractYamlControlledTermValueConstraintWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/AbstractYamlControlledTermValueConstraintWriter';
import { YamlFieldWriterEmail } from '../../../model/cedar/field/dynamic/email/YamlFieldWriterEmail';
import { YamlFieldWriterNumeric } from '../../../model/cedar/field/dynamic/numeric/YamlFieldWriterNumeric';
import { YamlFieldWriterPhoneNumber } from '../../../model/cedar/field/dynamic/phone-number/YamlFieldWriterPhoneNumber';
import { YamlFieldWriterCheckbox } from '../../../model/cedar/field/dynamic/checkbox/YamlFieldWriterCheckbox';
import { YamlFieldWriterList } from '../../../model/cedar/field/dynamic/list/YamlFieldWriterList';
import { YamlFieldWriterRadio } from '../../../model/cedar/field/dynamic/radio/YamlFieldWriterRadio';
import { YamlFieldWriterControlledTerm } from '../../../model/cedar/field/dynamic/controlled-term/YamlFieldWriterControlledTerm';
import { YamlValueConstraintsOntologyWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/ontology/YamlValueConstraintsOntologyWriter';
import { YamlValueConstraintsClassWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/class/YamlValueConstraintsClassWriter';
import { YamlValueConstraintsBranchWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/branch/YamlValueConstraintsBranchWriter';
import { YamlValueConstraintsValueSetWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/value-set/YamlValueConstraintsValueSetWriter';
import { YamlValueConstraintsActionWriter } from '../../../model/cedar/field/dynamic/controlled-term/value-constraint/action/YamlValueConstraintsActionWriter';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';

export class CedarYamlWriters {
  private readonly behavior: YamlWriterBehavior;
  private readonly yamlDynamicFieldWriters: Map<CedarFieldType, YamlTemplateFieldWriterInternal>;
  private readonly yamlStaticFieldWriters: Map<CedarFieldType, YamlTemplateFieldWriterInternal>;
  private readonly yamlValueConstraintsWriters: Map<string, AbstractYamlControlledTermValueConstraintWriter>;
  private readonly yamlAtomicWriter: YamlAtomicWriter;
  private readonly yamlAnnotationsWriter: YamlAnnotationsWriter;
  private readonly yamlTemplateWriter: YamlTemplateWriter;
  private readonly yamlTemplateElementWriter: YamlTemplateElementWriter;

  private constructor(behavior: YamlWriterBehavior) {
    this.behavior = behavior;
    // YAML writers. Order is important
    this.yamlAtomicWriter = new YamlAtomicWriter(behavior);
    this.yamlAnnotationsWriter = new YamlAnnotationsWriter(behavior);
    this.yamlTemplateWriter = YamlTemplateWriter.getFor(behavior, this);
    this.yamlTemplateElementWriter = YamlTemplateElementWriter.getFor(behavior, this);

    this.yamlDynamicFieldWriters = new Map<CedarFieldType, YamlTemplateFieldWriterInternal>([
      [CedarFieldType.TEXT, new YamlFieldWriterTextField(behavior, this)],
      [CedarFieldType.TEXTAREA, new YamlFieldWriterTextArea(behavior, this)],
      [CedarFieldType.CONTROLLED_TERM, new YamlFieldWriterControlledTerm(behavior, this)],
      [CedarFieldType.PHONE_NUMBER, new YamlFieldWriterPhoneNumber(behavior, this)],
      [CedarFieldType.EMAIL, new YamlFieldWriterEmail(behavior, this)],
      [CedarFieldType.LINK, new YamlFieldWriterLink(behavior, this)],
      [CedarFieldType.NUMERIC, new YamlFieldWriterNumeric(behavior, this)],
      [CedarFieldType.TEMPORAL, new YamlFieldWriterTemporal(behavior, this)],
      [CedarFieldType.RADIO, new YamlFieldWriterRadio(behavior, this)],
      [CedarFieldType.CHECKBOX, new YamlFieldWriterCheckbox(behavior, this)],
      [CedarFieldType.SINGLE_SELECT_LIST, new YamlFieldWriterList(behavior, this)],
      [CedarFieldType.MULTIPLE_SELECT_LIST, new YamlFieldWriterList(behavior, this)],
      [CedarFieldType.ATTRIBUTE_VALUE, new YamlFieldWriterAttributeValue(behavior, this)],
    ]);

    this.yamlStaticFieldWriters = new Map<CedarFieldType, YamlTemplateFieldWriterInternal>([
      [CedarFieldType.STATIC_PAGE_BREAK, new YamlFieldWriterStaticPageBreak(behavior, this)],
      [CedarFieldType.STATIC_SECTION_BREAK, new YAMLFieldWriterStaticSectionsBreak(behavior, this)],
      [CedarFieldType.STATIC_IMAGE, new YamlFieldWriterStaticImage(behavior, this)],
      [CedarFieldType.STATIC_RICH_TEXT, new YamlFieldWriterStaticRichText(behavior, this)],
      [CedarFieldType.STATIC_YOUTUBE, new YamlFieldWriterStaticYoutube(behavior, this)],
    ]);

    this.yamlValueConstraintsWriters = new Map<string, AbstractYamlControlledTermValueConstraintWriter>([
      [ControlledTermOntology.className, new YamlValueConstraintsOntologyWriter(behavior, this)],
      [ControlledTermClass.className, new YamlValueConstraintsClassWriter(behavior, this)],
      [ControlledTermBranch.className, new YamlValueConstraintsBranchWriter(behavior, this)],
      [ControlledTermValueSet.className, new YamlValueConstraintsValueSetWriter(behavior, this)],
      [ControlledTermAction.className, new YamlValueConstraintsActionWriter(behavior, this)],
    ]);
  }

  public static getStrict(): CedarYamlWriters {
    return new CedarYamlWriters(YamlWriterBehavior.STRICT);
  }

  public static getFor(behavior: YamlWriterBehavior): CedarYamlWriters {
    return new CedarYamlWriters(behavior);
  }

  public getFieldWriterForType(cedarFieldType: CedarFieldType): YamlTemplateFieldWriterInternal {
    let writer: YamlTemplateFieldWriterInternal | undefined;
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

  public getFieldWriterForField(field: TemplateField): YamlTemplateFieldWriterInternal {
    return this.getFieldWriterForType(field.cedarFieldType);
  }

  getAtomicWriter(): YamlAtomicWriter {
    return this.yamlAtomicWriter;
  }

  getAnnotationsWriter(): YamlAnnotationsWriter {
    return this.yamlAnnotationsWriter;
  }

  getTemplateWriter(): YamlTemplateWriter {
    return this.yamlTemplateWriter;
  }

  getTemplateElementWriter(): YamlTemplateElementWriter {
    return this.yamlTemplateElementWriter;
  }

  public getWriterForValueConstraint(object: ControlledTermAbstractValueConstraint): AbstractYamlControlledTermValueConstraintWriter {
    const className = object.className;
    const writer = this.yamlValueConstraintsWriters.get(className);
    if (writer) {
      return writer;
    }
    throw new Error(`No YAML writer found for class type: ${className}`);
  }
}
