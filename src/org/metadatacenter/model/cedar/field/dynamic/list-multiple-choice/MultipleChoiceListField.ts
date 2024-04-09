import { ListField } from '../list/ListField';
import { ValueConstraintsListField } from '../list/ValueConstraintsListField';
import { ChildDeploymentInfoAlwaysMultipleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysMultipleBuilder';

export interface MultipleChoiceListField extends ListField {
  get valueConstraints(): ValueConstraintsListField;

  get multipleChoice(): boolean;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysMultipleBuilder;
}
