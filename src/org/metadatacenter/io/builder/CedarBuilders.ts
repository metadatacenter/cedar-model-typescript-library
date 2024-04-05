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
    return ListFieldBuilderImpl.create();
  }

  static radioFieldBuilder(): RadioFieldBuilder {
    return RadioFieldBuilderImpl.create();
  }

  static checkboxFieldBuilder(): CheckboxFieldBuilder {
    return new CheckboxFieldBuilder();
  }

  static controlledTermFieldBuilder(): ControlledTermFieldBuilder {
    return new ControlledTermFieldBuilder();
  }

  static childDeploymentBuilder(child: TemplateChild, childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(child, childName);
  }
}
