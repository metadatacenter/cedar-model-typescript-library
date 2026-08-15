import { ListFieldImpl } from '../list/ListFieldImpl';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ListField } from '../list/ListField';
import { SingleChoiceListField } from './SingleChoiceListField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';

/**
 * A list a form offers one option from.
 *
 * Its cardinality is a separate question from how many options it offers, so it takes the ordinary
 * deployment builder rather than the always-single one. It was single-instance by definition, which
 * left a repeatable single-select — a field a form asks several times, one answer each — with nowhere
 * to live: a template declaring one was read as a multi-select instead, and written back saying so.
 */
export class SingleChoiceListFieldImpl extends ListFieldImpl implements ListField {
  private constructor() {
    super();
    this.multipleChoice = false;
    this.cedarFieldType = CedarFieldType.SINGLE_SELECT_LIST;
  }

  public static buildEmpty(): SingleChoiceListField {
    return new SingleChoiceListFieldImpl();
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder {
    return new ChildDeploymentInfoBuilder(this, childName);
  }
}
