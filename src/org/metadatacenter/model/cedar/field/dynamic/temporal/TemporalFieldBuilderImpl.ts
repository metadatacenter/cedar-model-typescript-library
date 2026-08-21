import { TemporalField } from './TemporalField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';
import { TemporalFieldBuilder } from './TemporalFieldBuilder';
import { TemporalFieldImpl } from './TemporalFieldImpl';
import { TemporalDefaultValueValidator } from './TemporalDefaultValueValidator';

export class TemporalFieldBuilderImpl extends TemplateFieldBuilder implements TemporalFieldBuilder {
  private timezoneEnabled: boolean = false;
  private inputTimeFormat: TimeFormat = TimeFormat.NULL;
  private temporalGranularity: TemporalGranularity = TemporalGranularity.NULL;
  private temporalType: TemporalType = TemporalType.DATETIME;
  private defaultValue: string | null = null;

  private constructor() {
    super();
  }

  public static create(): TemporalFieldBuilder {
    return new TemporalFieldBuilderImpl();
  }

  public withTimezoneEnabled(timezoneEnabled: boolean): TemporalFieldBuilder {
    this.timezoneEnabled = timezoneEnabled;
    return this;
  }

  public withInputTimeFormat(inputTimeFormat: TimeFormat): TemporalFieldBuilder {
    this.inputTimeFormat = inputTimeFormat;
    return this;
  }

  public withTemporalGranularity(temporalGranularity: TemporalGranularity): TemporalFieldBuilder {
    this.temporalGranularity = temporalGranularity;
    return this;
  }

  public withTemporalType(temporalType: TemporalType): TemporalFieldBuilder {
    this.temporalType = temporalType;
    return this;
  }

  public withDefaultValue(defaultValue: string | null): TemporalFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): TemporalField {
    TemporalDefaultValueValidator.assertValid(this.temporalType, this.temporalGranularity, this.defaultValue);
    const temporalField = TemporalFieldImpl.buildEmpty();
    super.buildInternal(temporalField);

    temporalField.timezoneEnabled = this.timezoneEnabled;
    temporalField.inputTimeFormat = this.inputTimeFormat;
    temporalField.temporalGranularity = this.temporalGranularity;
    temporalField.valueConstraints.temporalType = this.temporalType;
    temporalField.valueConstraints.defaultValue = this.defaultValue;

    return temporalField;
  }
}
