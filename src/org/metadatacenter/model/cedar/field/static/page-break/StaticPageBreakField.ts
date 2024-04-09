import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoStaticBuilder } from '../../../deployment/ChildDeploymentInfoStaticBuilder';

export interface StaticPageBreakField extends TemplateField {
  createDeploymentBuilder(childName: string): ChildDeploymentInfoStaticBuilder;
}
