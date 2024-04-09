import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';
import { AttributeValueField } from './AttributeValueField';
import { ChildDeploymentInfoAlwaysMultipleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysMultipleBuilder';

export class AttributeValueFieldImpl extends TemplateField implements AttributeValueField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.ATTRIBUTE_VALUE;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): AttributeValueField {
    return new AttributeValueFieldImpl();
  }

  override isMultiInstanceByDefinition(): boolean {
    return true;
  }

  override createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysMultipleBuilder {
    return new ChildDeploymentInfoAlwaysMultipleBuilder(this, childName);
  }
}
