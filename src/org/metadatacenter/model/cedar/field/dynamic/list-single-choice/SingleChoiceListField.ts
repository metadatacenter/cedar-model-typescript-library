import { ListField } from '../list/ListField';
import { ValueConstraintsListField } from '../list/ValueConstraintsListField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface SingleChoiceListField extends ListField {
  get valueConstraints(): ValueConstraintsListField;

  get multipleChoice(): boolean;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
