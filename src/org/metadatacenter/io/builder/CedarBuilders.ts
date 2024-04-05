import { TextFieldBuilder } from '../../model/cedar/field/dynamic/textfield/TextFieldBuilder';
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
import { ChildDeploymentInfoBuilder } from '../../model/cedar/deployment/ChildDeploymentInfoBuilder';
import { TemplateChild } from '../../model/cedar/types/basic-types/TemplateChild';
import { TemplateElementBuilder } from '../../model/cedar/element/TemplateElementBuilder';
import { TextFieldBuilderImpl } from '../../model/cedar/field/dynamic/textfield/TextFieldBuilderImpl';
import { TextAreaBuilderImpl } from '../../model/cedar/field/dynamic/textarea/TextAreaBuilderImpl';
import { TextAreaBuilder } from '../../model/cedar/field/dynamic/textarea/TextAreaBuilder';
import { TemporalFieldBuilderImpl } from '../../model/cedar/field/dynamic/temporal/TemporalFieldBuilderImpl';
import { RadioFieldBuilderImpl } from '../../model/cedar/field/dynamic/radio/RadioFieldBuilderImpl';
import { PhoneNumberFieldBuilderImpl } from '../../model/cedar/field/dynamic/phone-number/PhoneNumberFieldBuilderImpl';
import { NumericFieldBuilderImpl } from '../../model/cedar/field/dynamic/numeric/NumericFieldBuilderImpl';
import { ListFieldBuilderImpl } from '../../model/cedar/field/dynamic/list/ListFieldBuilderImpl';
import { LinkFieldBuilderImpl } from '../../model/cedar/field/dynamic/link/LinkFieldBuilderImpl';
import { EmailFieldBuilderImpl } from '../../model/cedar/field/dynamic/email/EmailFieldBuilderImpl';
import { AttributeValueFieldBuilderImpl } from '../../model/cedar/field/dynamic/attribute-value/AttributeValueFieldBuilderImpl';
import { CheckboxFieldBuilderImpl } from '../../model/cedar/field/dynamic/checkbox/CheckboxFieldBuilderImpl';
import { ControlledTermFieldBuilderImpl } from '../../model/cedar/field/dynamic/controlled-term/ControlledTermFieldBuilderImpl';
import { StaticImageFieldBuilderImpl } from '../../model/cedar/field/static/image/StaticImageFieldBuilderImpl';
import { StaticPageBreakFieldBuilderImpl } from '../../model/cedar/field/static/page-break/StaticPageBreakFieldBuilderImpl';
import { StaticRichTextFieldBuilderImpl } from '../../model/cedar/field/static/rich-text/StaticRichTextFieldBuilderImpl';
import { StaticSectionBreakFieldBuilderImpl } from '../../model/cedar/field/static/section-break/StaticSectionBreakFieldBuilderImpl';
import { StaticYoutubeFieldBuilderImpl } from '../../model/cedar/field/static/youtube/StaticYoutubeFieldBuilderImpl';

export abstract class CedarBuilders {
  static templateBuilder(): TemplateBuilder {
    return new TemplateBuilder();
  }

  static templateElementBuilder(): TemplateElementBuilder {
    return new TemplateElementBuilder();
  }

  static textFieldBuilder(): TextFieldBuilder {
    return TextFieldBuilderImpl.create();
  }

  static textAreaBuilder(): TextAreaBuilder {
    return TextAreaBuilderImpl.create();
  }

  static temporalFieldBuilder(): TemporalFieldBuilder {
    return TemporalFieldBuilderImpl.create();
  }

  static phoneNumberFieldBuilder(): PhoneNumberFieldBuilder {
    return PhoneNumberFieldBuilderImpl.create();
  }

  static numericFieldBuilder(): NumericFieldBuilder {
    return NumericFieldBuilderImpl.create();
  }

  static emailFieldBuilder(): EmailFieldBuilder {
    return EmailFieldBuilderImpl.create();
  }

  static attributeValueFieldBuilder(): AttributeValueFieldBuilder {
    return AttributeValueFieldBuilderImpl.create();
  }

  static youtubeFieldBuilder(): StaticYoutubeFieldBuilder {
    return StaticYoutubeFieldBuilderImpl.create();
  }

  static sectionBreakFieldBuilder(): StaticSectionBreakFieldBuilder {
    return StaticSectionBreakFieldBuilderImpl.create();
  }

  static richTextFieldBuilder(): StaticRichTextFieldBuilder {
    return StaticRichTextFieldBuilderImpl.create();
  }

  static pageBreakFieldBuilder(): StaticPageBreakFieldBuilder {
    return StaticPageBreakFieldBuilderImpl.create();
  }

  static imageFieldBuilder(): StaticImageFieldBuilder {
    return StaticImageFieldBuilderImpl.create();
  }

  static linkFieldBuilder(): LinkFieldBuilder {
    return LinkFieldBuilderImpl.create();
  }

  static listFieldBuilder(): ListFieldBuilder {
    return ListFieldBuilderImpl.create();
  }

  static radioFieldBuilder(): RadioFieldBuilder {
    return RadioFieldBuilderImpl.create();
  }

  static checkboxFieldBuilder(): CheckboxFieldBuilder {
    return CheckboxFieldBuilderImpl.create();
  }

  static controlledTermFieldBuilder(): ControlledTermFieldBuilder {
    return ControlledTermFieldBuilderImpl.create();
  }

  static childDeploymentBuilder(child: TemplateChild, childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(child, childName);
  }
}
