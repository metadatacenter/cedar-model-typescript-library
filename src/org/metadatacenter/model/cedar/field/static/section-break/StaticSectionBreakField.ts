import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoStaticBuilder } from '../../../deployment/ChildDeploymentInfoStaticBuilder';

export interface StaticSectionBreakField extends TemplateField {
  createDeploymentBuilder(childName: string): ChildDeploymentInfoStaticBuilder;
}
