import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { YAMLReaderBehavior } from '../../../behavior/YAMLReaderBehavior';
import { YAMLAbstractArtifactReader } from './YAMLAbstractArtifactReader';
import { YAMLTemplateReader } from './YAMLTemplateReader';
import { YAMLTemplateElementReader } from './YAMLTemplateElementReader';
import { YAMLTemplateFieldReader } from './YAMLTemplateFieldReader';

export class CedarYAMLReaders {
  private readonly behavior: YAMLReaderBehavior;

  private constructor(behavior: YAMLReaderBehavior) {
    this.behavior = behavior;
  }

  public static getStrict(): CedarYAMLReaders {
    return new CedarYAMLReaders(YAMLReaderBehavior.STRICT);
  }

  public getReaderForArtifactType(cedarArtifactType: CedarArtifactType): YAMLAbstractArtifactReader {
    switch (cedarArtifactType) {
      case CedarArtifactType.TEMPLATE:
        return YAMLTemplateReader.getStrict();
      case CedarArtifactType.TEMPLATE_ELEMENT:
        return YAMLTemplateElementReader.getStrict();
      case CedarArtifactType.TEMPLATE_FIELD:
        return YAMLTemplateFieldReader.getStrict();
      case CedarArtifactType.STATIC_TEMPLATE_FIELD:
        return YAMLTemplateFieldReader.getStrict();
      default:
        throw new Error(`No YAML reader available for CedarArtifactType: ${cedarArtifactType}`);
    }
  }
}
