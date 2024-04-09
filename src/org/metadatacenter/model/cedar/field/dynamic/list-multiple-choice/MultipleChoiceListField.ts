import { ListField } from '../list/ListField';
import { ValueConstraintsListField } from '../list/ValueConstraintsListField';
import { ChildDeploymentInfoMultipleChoiceListBuilder } from '../../../deployment/ChildDeploymentInfoMultipleChoiceListBuilder';

export interface MultipleChoiceListField extends ListField {
  get valueConstraints(): ValueConstraintsListField;

  get multipleChoice(): boolean;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoMultipleChoiceListBuilder;
}
