import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsTemporalField } from './ValueConstraintsTemporalField';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';

export class TemporalField extends TemplateField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsTemporalField;

  public timezoneEnabled: boolean = false;
  public inputTimeFormat: TimeFormat = TimeFormat.NULL;
  public temporalGranularity: TemporalGranularity = TemporalGranularity.NULL;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.TEMPORAL;
    this.valueConstraints = new ValueConstraintsTemporalField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): TemporalField {
    return new TemporalField();
  }

  public static buildEmptyWithDefaultValues(): TemporalField {
    const r = new TemporalField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
