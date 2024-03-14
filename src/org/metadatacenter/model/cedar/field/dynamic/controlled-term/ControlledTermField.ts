import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { ValueConstraintsControlledTermField } from './ValueConstraintsControlledTermField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';

export class ControlledTermField extends TemplateField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsControlledTermField;

  public valueRecommendationEnabled: boolean = false;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.CONTROLLED_TERM;
    this.valueConstraints = new ValueConstraintsControlledTermField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): ControlledTermField {
    return new ControlledTermField();
  }

  public static buildEmptyWithDefaultValues(): ControlledTermField {
    const r = new ControlledTermField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
