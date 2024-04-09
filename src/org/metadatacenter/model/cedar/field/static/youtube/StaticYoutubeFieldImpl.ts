import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { StaticYoutubeField } from './StaticYoutubeField';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysSingleBuilder';

export class StaticYoutubeFieldImpl extends TemplateField implements StaticYoutubeField {
  public videoId: string | null = null;
  public width: number | null = null;
  public height: number | null = null;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_YOUTUBE;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmpty(): StaticYoutubeField {
    return new StaticYoutubeFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysSingleBuilder {
    return new ChildDeploymentInfoAlwaysSingleBuilder(this, childName);
  }
}
