import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysSingleBuilder';

export interface StaticPageBreakField extends TemplateField {
  createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysSingleBuilder;
}
