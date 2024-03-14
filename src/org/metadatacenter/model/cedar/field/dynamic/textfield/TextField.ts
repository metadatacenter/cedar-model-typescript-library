import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { ValueConstraintsTextField } from './ValueConstraintsTextField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';

export class TextField extends TemplateField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsTextField;

  public valueRecommendationEnabled: boolean = false;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.TEXT;
    this.valueConstraints = new ValueConstraintsTextField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): TextField {
    return new TextField();
  }

  public static buildEmptyWithDefaultValues(): TextField {
    const r = new TextField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
