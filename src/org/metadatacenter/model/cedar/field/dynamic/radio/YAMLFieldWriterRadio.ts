import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { RadioField } from './RadioField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { TextField } from '../textfield/TextField';
import { YamlKeys } from '../../../constants/YamlKeys';
import { XsdDatatype } from '../../../constants/XsdDatatype';

export class YAMLFieldWriterRadio extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(uiNode: JsonNode, _field: TextField, _childInfo: ChildDeploymentInfo): void {
    uiNode[YamlKeys.datatype] = XsdDatatype.STRING;
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: RadioField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNodeForYAML(vcNode, field, childInfo);
    this.expandLiterals(field, vcNode);
  }
}