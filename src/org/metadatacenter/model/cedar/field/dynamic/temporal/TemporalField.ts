import { TemplateField } from '../../TemplateField';
import { ValueConstraintsTemporalField } from './ValueConstraintsTemporalField';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';

export interface TemporalField extends TemplateField {
  get valueConstraints(): ValueConstraintsTemporalField;

  get timezoneEnabled(): boolean;

  set timezoneEnabled(timezoneEnable: boolean);

  get inputTimeFormat(): TimeFormat;

  set inputTimeFormat(imeFormat: TimeFormat);

  get temporalGranularity(): TemporalGranularity;

  set temporalGranularity(temporalGranularity: TemporalGranularity);
}
