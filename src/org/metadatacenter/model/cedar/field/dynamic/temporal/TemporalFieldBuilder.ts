import { TemporalField } from './TemporalField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';

export interface TemporalFieldBuilder extends TemplateFieldBuilder {
  withTimezoneEnabled(timezoneEnabled: boolean): TemporalFieldBuilder;

  withInputTimeFormat(inputTimeFormat: TimeFormat): TemporalFieldBuilder;

  withTemporalGranularity(temporalGranularity: TemporalGranularity): TemporalFieldBuilder;

  withTemporalType(temporalType: TemporalType): TemporalFieldBuilder;

  build(): TemporalField;
}
