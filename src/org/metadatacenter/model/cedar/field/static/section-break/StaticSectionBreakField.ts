import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';

export class StaticSectionBreakField extends TemplateField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_SECTION_BREAK;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): StaticSectionBreakField {
    return new StaticSectionBreakField();
  }

  public static buildEmptyWithDefaultValues(): StaticSectionBreakField {
    const r = new StaticSectionBreakField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
