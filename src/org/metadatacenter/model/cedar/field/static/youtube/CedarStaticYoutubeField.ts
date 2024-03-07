import { SchemaVersion } from '../../../beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../beans/CedarFieldType';
import { CedarArtifactType } from '../../../beans/CedarArtifactType';

export class CedarStaticYoutubeField extends CedarField {
  public videoId: string | null = null;
  public width: number | null = null;
  public height: number | null = null;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_YOUTUBE;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarStaticYoutubeField {
    return new CedarStaticYoutubeField();
  }

  public static buildEmptyWithDefaultValues(): CedarStaticYoutubeField {
    const r = new CedarStaticYoutubeField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
