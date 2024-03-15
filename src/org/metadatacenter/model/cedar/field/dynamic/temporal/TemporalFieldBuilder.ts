// Import the necessary classes
import { TemporalField } from './TemporalField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';

export class TemporalFieldBuilder extends TemplateFieldBuilder {
  private timezoneEnabled: boolean = false;
  private inputTimeFormat: TimeFormat = TimeFormat.NULL;
  private temporalGranularity: TemporalGranularity = TemporalGranularity.NULL;
  private temporalType: TemporalType = TemporalType.NULL;

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

  public build(): TemporalField {
    const temporalField = TemporalField.buildEmptyWithNullValues();
    super.buildInternal(temporalField);

    temporalField.timezoneEnabled = this.timezoneEnabled;
    temporalField.inputTimeFormat = this.inputTimeFormat;
    temporalField.temporalGranularity = this.temporalGranularity;
    temporalField.valueConstraints.temporalType = this.temporalType;

    return temporalField;
  }
}
