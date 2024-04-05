import { StaticYoutubeField } from './StaticYoutubeField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export interface StaticYoutubeFieldBuilder extends TemplateFieldBuilder {
  withVideoId(videoId: string | null): StaticYoutubeFieldBuilder;

  withWidth(width: number | null): StaticYoutubeFieldBuilder;

  withHeight(height: number | null): StaticYoutubeFieldBuilder;

  build(): StaticYoutubeField;
}
