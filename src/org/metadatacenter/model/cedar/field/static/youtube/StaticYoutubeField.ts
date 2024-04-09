import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysSingleBuilder';

export interface StaticYoutubeField extends TemplateField {
  set videoId(videoId: string | null);

  get videoId(): string | null;

  set width(width: number | null);

  get width(): number | null;

  set height(height: number | null);

  get height(): number | null;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysSingleBuilder;
}
