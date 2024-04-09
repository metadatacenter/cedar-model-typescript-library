import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysSingleBuilder';

export interface StaticSectionBreakField extends TemplateField {
  createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysSingleBuilder;
}
