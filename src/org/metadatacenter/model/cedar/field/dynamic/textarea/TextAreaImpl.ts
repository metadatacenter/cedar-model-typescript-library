import { TemplateField } from '../../TemplateField';
import { ValueConstraints } from '../../ValueConstraints';
import { TextArea } from './TextArea';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';

export class TextAreaImpl extends TemplateField implements TextArea {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.TEXTAREA;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): TextArea {
    return new TextAreaImpl();
  }
}
