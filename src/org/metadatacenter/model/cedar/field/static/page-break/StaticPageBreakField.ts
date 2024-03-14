import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';

export class StaticPageBreakField extends TemplateField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_PAGE_BREAK;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): StaticPageBreakField {
    return new StaticPageBreakField();
  }

  public static buildEmptyWithDefaultValues(): StaticPageBreakField {
    const r = new StaticPageBreakField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
