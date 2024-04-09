import { ListFieldImpl } from '../list/ListFieldImpl';
import { ListField } from '../list/ListField';
import { MultipleChoiceListField } from './MultipleChoiceListField';
import { ChildDeploymentInfoMultipleChoiceListBuilder } from '../../../deployment/ChildDeploymentInfoMultipleChoiceListBuilder';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';

export class MultipleChoiceListFieldImpl extends ListFieldImpl implements ListField {
  private constructor() {
    super();
    this.multipleChoice = true;
    this.cedarFieldType = CedarFieldType.MULTIPLE_SELECT_LIST;
  }

  public static buildEmpty(): MultipleChoiceListField {
    return new MultipleChoiceListFieldImpl();
  }

  override isMultiInstanceByDefinition(): boolean {
    return true;
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoMultipleChoiceListBuilder {
    return new ChildDeploymentInfoMultipleChoiceListBuilder(this, childName);
  }
}
