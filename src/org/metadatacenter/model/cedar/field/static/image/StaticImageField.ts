import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoStaticBuilder } from '../../../deployment/ChildDeploymentInfoStaticBuilder';

export interface StaticImageField extends TemplateField {
  set content(content: string | null);

  get content(): string | null;

  set width(width: number | null);

  get width(): number | null;

  set height(height: number | null);

  get height(): number | null;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoStaticBuilder;
}
