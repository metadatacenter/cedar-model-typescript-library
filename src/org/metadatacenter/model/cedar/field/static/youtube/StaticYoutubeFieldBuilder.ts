import { StaticYoutubeField } from './StaticYoutubeField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export class StaticYoutubeFieldBuilder extends TemplateFieldBuilder {
  private videoId: string | null = null;
  private width: number | null = null;
  private height: number | null = null;

  public withVideoId(videoId: string | null): StaticYoutubeFieldBuilder {
    this.videoId = videoId;
    return this;
  }

  public withWidth(width: number | null): StaticYoutubeFieldBuilder {
    this.width = width;
    return this;
  }

  public withHeight(height: number | null): StaticYoutubeFieldBuilder {
    this.height = height;
    return this;
  }

  public build(): StaticYoutubeField {
    const staticYoutubeField = StaticYoutubeField.buildEmptyWithNullValues();
    super.buildInternal(staticYoutubeField);
    staticYoutubeField.videoId = this.videoId;
    staticYoutubeField.width = this.width;
    staticYoutubeField.height = this.height;
    return staticYoutubeField;
  }
}
