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
import { YAMLTemplateWriter } from '../../model/cedar/template/YAMLTemplateWriter';
import { JSONFieldWriterRadio } from '../../model/cedar/field/dynamic/radio/JSONFieldWriterRadio';

export class CedarWriters {
  private behavior: JSONWriterBehavior;
  private readonly jsonAtomicWriter: JSONAtomicWriter;
  private readonly jsonFieldWriter: JSONFieldWriter;
  private readonly jsonTemplateWriter: JSONTemplateWriter;
  //
  private readonly yamlTemplateWriter: YAMLTemplateWriter;
  //
  private readonly jsonFieldWriterTextField: JSONFieldWriterTextField;
  private readonly jsonFieldWriterLink: JSONFieldWriterLink;
  private readonly jsonFieldWriterNumeric: JSONFieldWriterNumeric;
  private readonly jsonFieldWriterTemporal: JSONFieldWriterTemporal;
  private readonly jsonFieldWriterRadio: JSONFieldWriterRadio;
  private readonly jsonFieldWriterStaticPageBreak: JSONFieldWriterStaticPageBreak;
  private readonly jsonFieldWriterStaticSectionBreak: JSONFieldWriterStaticSectionsBreak;
  private readonly jsonFieldWriterStaticImage: JSONFieldWriterStaticImage;
  private readonly jsonFieldWriterStaticRichText: JSONFieldWriterStaticRichText;
  private readonly jsonFieldWriterStaticYoutube: JSONFieldWriterStaticYoutube;

  private constructor(behavior: JSONWriterBehavior) {
    this.behavior = behavior;
    this.jsonAtomicWriter = new JSONAtomicWriter(behavior);
    this.jsonFieldWriter = JSONFieldWriter.getFor(behavior, this);
    this.jsonFieldWriterTextField = new JSONFieldWriterTextField(behavior, this);
    this.jsonFieldWriterLink = new JSONFieldWriterLink(behavior, this);
    this.jsonFieldWriterNumeric = new JSONFieldWriterNumeric(behavior, this);
    this.jsonFieldWriterTemporal = new JSONFieldWriterTemporal(behavior, this);
    this.jsonFieldWriterRadio = new JSONFieldWriterRadio(behavior, this);
    this.jsonFieldWriterStaticPageBreak = new JSONFieldWriterStaticPageBreak(behavior, this);
    this.jsonFieldWriterStaticSectionBreak = new JSONFieldWriterStaticSectionsBreak(behavior, this);
    this.jsonFieldWriterStaticImage = new JSONFieldWriterStaticImage(behavior, this);
    this.jsonFieldWriterStaticRichText = new JSONFieldWriterStaticRichText(behavior, this);
    this.jsonFieldWriterStaticYoutube = new JSONFieldWriterStaticYoutube(behavior, this);
    this.jsonTemplateWriter = JSONTemplateWriter.getFor(behavior, this);
    //
    this.yamlTemplateWriter = YAMLTemplateWriter.getFor(behavior, this);
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
    if (cedarFieldType == CedarFieldType.TEXT) {
      return this.jsonFieldWriterTextField;
    } else if (cedarFieldType == CedarFieldType.LINK) {
      return this.jsonFieldWriterLink;
    } else if (cedarFieldType == CedarFieldType.NUMERIC) {
      return this.jsonFieldWriterNumeric;
    } else if (cedarFieldType == CedarFieldType.TEMPORAL) {
      return this.jsonFieldWriterTemporal;
    } else if (cedarFieldType == CedarFieldType.RADIO) {
      return this.jsonFieldWriterRadio;
    } else if (cedarFieldType == CedarFieldType.STATIC_PAGE_BREAK) {
      return this.jsonFieldWriterStaticPageBreak;
    } else if (cedarFieldType == CedarFieldType.STATIC_SECTION_BREAK) {
      return this.jsonFieldWriterStaticSectionBreak;
    } else if (cedarFieldType == CedarFieldType.STATIC_IMAGE) {
      return this.jsonFieldWriterStaticImage;
    } else if (cedarFieldType == CedarFieldType.STATIC_RICH_TEXT) {
      return this.jsonFieldWriterStaticRichText;
    } else if (cedarFieldType == CedarFieldType.STATIC_YOUTUBE) {
      return this.jsonFieldWriterStaticYoutube;
    }
    return this.jsonFieldWriter;
  }

  getYAMLTemplateWriter(): YAMLTemplateWriter {
    return this.yamlTemplateWriter;
  }
}
