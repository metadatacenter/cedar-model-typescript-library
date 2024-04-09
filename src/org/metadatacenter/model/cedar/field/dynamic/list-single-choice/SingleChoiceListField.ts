import { ListField } from '../list/ListField';
import { ValueConstraintsListField } from '../list/ValueConstraintsListField';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysSingleBuilder';

export interface SingleChoiceListField extends ListField {
  get valueConstraints(): ValueConstraintsListField;

  get multipleChoice(): boolean;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysSingleBuilder;
}
