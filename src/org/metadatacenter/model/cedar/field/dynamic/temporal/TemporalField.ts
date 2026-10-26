import { TemplateField } from '../../TemplateField';
import { ValueConstraintsTemporalField } from './ValueConstraintsTemporalField';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface TemporalField extends TemplateField {
  get valueConstraints(): ValueConstraintsTemporalField;

  /** Whether the field's values carry a time zone, or null where the field does not state it. */
  get timezoneEnabled(): boolean | null;

  set timezoneEnabled(timezoneEnabled: boolean | null);

  get inputTimeFormat(): TimeFormat;

  set inputTimeFormat(imeFormat: TimeFormat);

  get temporalGranularity(): TemporalGranularity;

  set temporalGranularity(temporalGranularity: TemporalGranularity);

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
