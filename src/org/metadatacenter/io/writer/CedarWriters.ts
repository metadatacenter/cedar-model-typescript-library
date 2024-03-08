import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { JSONAtomicWriter } from './JSONAtomicWriter';
import { JSONFieldWriter } from '../../model/cedar/field/JSONFieldWriter';
import { JSONTemplateWriter } from '../../model/cedar/template/JSONTemplateWriter';
import { CedarFieldType } from '../../model/cedar/beans/CedarFieldType';
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
import { YAMLTemplateWriter } from '../../model/cedar/template/YAMLTemplateWriter';
import { JSONFieldWriterList } from '../../model/cedar/field/dynamic/list/JSONFieldWriterList';
import { JSONFieldWriterTextArea } from '../../model/cedar/field/dynamic/textarea/JSONFieldWriterTextArea';
import { JSONFieldWriterPhoneNumber } from '../../model/cedar/field/dynamic/phonenumber/JSONFieldWriterPhoneNumber';
import { JSONFieldWriterEmail } from '../../model/cedar/field/dynamic/email/JSONFieldWriterEmail';

export class CedarWriters {
  private readonly behavior: JSONWriterBehavior;
  private readonly dynamicFieldWriters: Map<CedarFieldType, JSONFieldWriter>;
  private readonly staticFieldWriters: Map<CedarFieldType, JSONFieldWriter>;
  private readonly jsonAtomicWriter: JSONAtomicWriter;
  private readonly jsonTemplateWriter: JSONTemplateWriter;
  private readonly yamlTemplateWriter: YAMLTemplateWriter;

  private constructor(behavior: JSONWriterBehavior) {
    this.behavior = behavior;
    this.jsonAtomicWriter = new JSONAtomicWriter(behavior);
    this.jsonTemplateWriter = JSONTemplateWriter.getFor(behavior, this);
    this.yamlTemplateWriter = YAMLTemplateWriter.getFor(behavior, this);

    this.dynamicFieldWriters = new Map<CedarFieldType, JSONFieldWriter>([
      [CedarFieldType.TEXT, new JSONFieldWriterTextField(behavior, this)],
      [CedarFieldType.TEXTAREA, new JSONFieldWriterTextArea(behavior, this)],
      [CedarFieldType.PHONE_NUMBER, new JSONFieldWriterPhoneNumber(behavior, this)],
      [CedarFieldType.EMAIL, new JSONFieldWriterEmail(behavior, this)],
      [CedarFieldType.LINK, new JSONFieldWriterLink(behavior, this)],
      [CedarFieldType.NUMERIC, new JSONFieldWriterNumeric(behavior, this)],
      [CedarFieldType.TEMPORAL, new JSONFieldWriterTemporal(behavior, this)],
      [CedarFieldType.RADIO, new JSONFieldWriterRadio(behavior, this)],
      [CedarFieldType.CHECKBOX, new JSONFieldWriterCheckbox(behavior, this)],
      [CedarFieldType.LIST, new JSONFieldWriterList(behavior, this)],
    ]);

    this.staticFieldWriters = new Map<CedarFieldType, JSONFieldWriter>([
      [CedarFieldType.STATIC_PAGE_BREAK, new JSONFieldWriterStaticPageBreak(behavior, this)],
      [CedarFieldType.STATIC_SECTION_BREAK, new JSONFieldWriterStaticSectionsBreak(behavior, this)],
      [CedarFieldType.STATIC_IMAGE, new JSONFieldWriterStaticImage(behavior, this)],
      [CedarFieldType.STATIC_RICH_TEXT, new JSONFieldWriterStaticRichText(behavior, this)],
      [CedarFieldType.STATIC_YOUTUBE, new JSONFieldWriterStaticYoutube(behavior, this)],
    ]);
  }

  public static getStrict(): CedarWriters {
    return new CedarWriters(JSONWriterBehavior.STRICT);
  }

  public static getFor(behavior: JSONWriterBehavior): CedarWriters {
    return new CedarWriters(behavior);
  }

  getJSONTemplateWriter(): JSONTemplateWriter {
    return this.jsonTemplateWriter;
  }

  getJSONAtomicWriter() {
    return this.jsonAtomicWriter;
  }

  getJSONFieldWriter(cedarFieldType: CedarFieldType): JSONFieldWriter {
    let writer = this.dynamicFieldWriters.get(cedarFieldType);
    if (writer) {
      return writer;
    }

    writer = this.staticFieldWriters.get(cedarFieldType);
    if (writer) {
      return writer;
    }

    throw new Error(`No writer found for field type: ${cedarFieldType.getValue()}`);
  }

  getYAMLTemplateWriter(): YAMLTemplateWriter {
    return this.yamlTemplateWriter;
  }
}
