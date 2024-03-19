import { TextFieldBuilder } from '../../model/cedar/field/dynamic/textfield/TextFieldBuilder';
import { TextAreaBuilder } from '../../model/cedar/field/dynamic/textarea/TextAreaBuilder';
import { TemporalFieldBuilder } from '../../model/cedar/field/dynamic/temporal/TemporalFieldBuilder';
import { PhoneNumberFieldBuilder } from '../../model/cedar/field/dynamic/phone-number/PhoneNumberFieldBuilder';
import { NumericFieldBuilder } from '../../model/cedar/field/dynamic/numeric/NumericFieldBuilder';
import { EmailFieldBuilder } from '../../model/cedar/field/dynamic/email/EmailFieldBuilder';
import { AttributeValueFieldBuilder } from '../../model/cedar/field/dynamic/attribute-value/AttributeValueFieldBuilder';
import { StaticYoutubeFieldBuilder } from '../../model/cedar/field/static/youtube/StaticYoutubeFieldBuilder';
import { StaticSectionBreakFieldBuilder } from '../../model/cedar/field/static/section-break/StaticSectionBreakFieldBuilder';
import { StaticRichTextFieldBuilder } from '../../model/cedar/field/static/rich-text/StaticRichTextFieldBuilder';
import { StaticPageBreakFieldBuilder } from '../../model/cedar/field/static/page-break/StaticPageBreakFieldBuilder';
import { StaticImageFieldBuilder } from '../../model/cedar/field/static/image/StaticImageFieldBuilder';
import { LinkFieldBuilder } from '../../model/cedar/field/dynamic/link/LinkFieldBuilder';
import { ListFieldBuilder } from '../../model/cedar/field/dynamic/list/ListFieldBuilder';
import { RadioFieldBuilder } from '../../model/cedar/field/dynamic/radio/RadioFieldBuilder';
import { CheckboxFieldBuilder } from '../../model/cedar/field/dynamic/checkbox/CheckboxFieldBuilder';
import { ControlledTermFieldBuilder } from '../../model/cedar/field/dynamic/controlled-term/ControlledTermFieldBuilder';
import { TemplateBuilder } from '../../model/cedar/template/TemplateBuilder';

export abstract class CedarBuilders {
  static templateBuilder(): TemplateBuilder {
    return new TemplateBuilder();
  }

  static textFieldBuilder(): TextFieldBuilder {
    return new TextFieldBuilder();
  }

  static textAreaBuilder(): TextAreaBuilder {
    return new TextAreaBuilder();
  }

  static temporalFieldBuilder(): TemporalFieldBuilder {
    return new TemporalFieldBuilder();
  }

  static phoneNumberFieldBuilder(): PhoneNumberFieldBuilder {
    return new PhoneNumberFieldBuilder();
  }

  static numericFieldBuilder(): NumericFieldBuilder {
    return new NumericFieldBuilder();
  }

  static emailFieldBuilder(): EmailFieldBuilder {
    return new EmailFieldBuilder();
  }

  static attributeValueFieldBuilder(): AttributeValueFieldBuilder {
    return new AttributeValueFieldBuilder();
  }

  static youtubeFieldBuilder(): StaticYoutubeFieldBuilder {
    return new StaticYoutubeFieldBuilder();
  }

  static sectionBreakFieldBuilder(): StaticSectionBreakFieldBuilder {
    return new StaticSectionBreakFieldBuilder();
  }

  static richTextFieldBuilder(): StaticRichTextFieldBuilder {
    return new StaticRichTextFieldBuilder();
  }

  static pageBreakFieldBuilder(): StaticPageBreakFieldBuilder {
    return new StaticPageBreakFieldBuilder();
  }

  static imageFieldBuilder(): StaticImageFieldBuilder {
    return new StaticImageFieldBuilder();
  }

  static linkFieldBuilder(): LinkFieldBuilder {
    return new LinkFieldBuilder();
  }

  static listFieldBuilder(): ListFieldBuilder {
    return new ListFieldBuilder();
  }

  static radioFieldBuilder(): RadioFieldBuilder {
    return new RadioFieldBuilder();
  }

  static checkboxFieldBuilder(): CheckboxFieldBuilder {
    return new CheckboxFieldBuilder();
  }

  static controlledTermFieldBuilder(): ControlledTermFieldBuilder {
    return new ControlledTermFieldBuilder();
  }
}
