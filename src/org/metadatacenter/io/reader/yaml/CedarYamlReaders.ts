import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlAbstractArtifactReader } from './YamlAbstractArtifactReader';
import { YamlTemplateReader } from './YamlTemplateReader';
import { YamlTemplateElementReader } from './YamlTemplateElementReader';
import { YamlTemplateFieldReader } from './YamlTemplateFieldReader';

export class CedarYamlReaders {
  private readonly behavior: YamlReaderBehavior;

  private constructor(behavior: YamlReaderBehavior) {
    this.behavior = behavior;
  }

  public static getStrict(): CedarYamlReaders {
    return new CedarYamlReaders(YamlReaderBehavior.STRICT);
  }

  /**
   * The named accessors the JSON side has had all along.
   *
   * Without them a consumer reading YAML has to import the concrete reader by
   * deep path, which makes the two serialisations look less interchangeable
   * than they are — the whole point being that either one yields the same
   * `Template`.
   */
  public getTemplateReader(): YamlTemplateReader {
    return YamlTemplateReader.getStrict();
  }

  public getTemplateElementReader(): YamlTemplateElementReader {
    return YamlTemplateElementReader.getStrict();
  }

  public getTemplateFieldReader(): YamlTemplateFieldReader {
    return YamlTemplateFieldReader.getStrict();
  }

  public getReaderForArtifactType(cedarArtifactType: CedarArtifactType): YamlAbstractArtifactReader {
    switch (cedarArtifactType) {
      case CedarArtifactType.TEMPLATE:
        return YamlTemplateReader.getStrict();
      case CedarArtifactType.TEMPLATE_ELEMENT:
        return YamlTemplateElementReader.getStrict();
      case CedarArtifactType.TEMPLATE_FIELD:
        return YamlTemplateFieldReader.getStrict();
      case CedarArtifactType.STATIC_TEMPLATE_FIELD:
        return YamlTemplateFieldReader.getStrict();
      default:
        throw new Error(`No YAML reader available for CedarArtifactType: ${cedarArtifactType}`);
    }
  }
}
