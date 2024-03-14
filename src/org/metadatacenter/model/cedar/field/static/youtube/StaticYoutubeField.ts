import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';

export class StaticYoutubeField extends TemplateField {
  public videoId: string | null = null;
  public width: number | null = null;
  public height: number | null = null;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_YOUTUBE;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): StaticYoutubeField {
    return new StaticYoutubeField();
  }

  public static buildEmptyWithDefaultValues(): StaticYoutubeField {
    const r = new StaticYoutubeField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
