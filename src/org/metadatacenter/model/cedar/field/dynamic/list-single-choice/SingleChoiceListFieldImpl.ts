import { ListFieldImpl } from '../list/ListFieldImpl';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysSingleBuilder';
import { ListField } from '../list/ListField';
import { SingleChoiceListField } from './SingleChoiceListField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';

export class SingleChoiceListFieldImpl extends ListFieldImpl implements ListField {
  private constructor() {
    super();
    this.multipleChoice = false;
    this.cedarFieldType = CedarFieldType.SINGLE_SELECT_LIST;
  }

  public static buildEmpty(): SingleChoiceListField {
    return new SingleChoiceListFieldImpl();
  }

  override isSingleInstanceByDefinition(): boolean {
    return true;
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysSingleBuilder {
    return new ChildDeploymentInfoAlwaysSingleBuilder(this, childName);
  }
}
