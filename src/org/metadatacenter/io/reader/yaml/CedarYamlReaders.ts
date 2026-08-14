import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlAbstractArtifactReader } from './YamlAbstractArtifactReader';
import { YamlTemplateReader } from './YamlTemplateReader';
import { YamlTemplateElementReader } from './YamlTemplateElementReader';
import { YamlTemplateFieldReader } from './YamlTemplateFieldReader';
import { YamlTemplateInstanceReader } from './YamlTemplateInstanceReader';

export class CedarYamlReaders {
  private readonly behavior: YamlReaderBehavior;
  private readonly isCompact: boolean;

  private constructor(behavior: YamlReaderBehavior, isCompact: boolean = false) {
    this.behavior = behavior;
    this.isCompact = isCompact;
  }

  public static getStrict(): CedarYamlReaders {
    return new CedarYamlReaders(YamlReaderBehavior.STRICT);
  }

  /**
   * Readers for the compact form, which omits the model version and the rest of what the system
   * records about an artifact. The readers above refuse that form: reading it has to be asked for,
   * here as in the Java library.
   */
  public static getStrictForCompact(): CedarYamlReaders {
    return new CedarYamlReaders(YamlReaderBehavior.STRICT, true);
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
    return YamlTemplateReader.getForBehavior(this.behavior, this.isCompact);
  }

  public getTemplateElementReader(): YamlTemplateElementReader {
    return YamlTemplateElementReader.getForBehavior(this.behavior, this.isCompact);
  }

  public getTemplateFieldReader(): YamlTemplateFieldReader {
    return YamlTemplateFieldReader.getForBehavior(this.behavior, this.isCompact);
  }

  public getTemplateInstanceReader(): YamlTemplateInstanceReader {
    return YamlTemplateInstanceReader.getForBehavior(this.behavior);
  }

  public getReaderForArtifactType(cedarArtifactType: CedarArtifactType): YamlAbstractArtifactReader | YamlTemplateInstanceReader {
    switch (cedarArtifactType) {
      case CedarArtifactType.TEMPLATE:
        return YamlTemplateReader.getForBehavior(this.behavior, this.isCompact);
      case CedarArtifactType.TEMPLATE_ELEMENT:
        return YamlTemplateElementReader.getForBehavior(this.behavior, this.isCompact);
      case CedarArtifactType.TEMPLATE_FIELD:
        return YamlTemplateFieldReader.getForBehavior(this.behavior, this.isCompact);
      case CedarArtifactType.STATIC_TEMPLATE_FIELD:
        return YamlTemplateFieldReader.getForBehavior(this.behavior, this.isCompact);
      case CedarArtifactType.TEMPLATE_INSTANCE:
        return YamlTemplateInstanceReader.getForBehavior(this.behavior);
      default:
        throw new Error(`No YAML reader available for CedarArtifactType: ${cedarArtifactType}`);
    }
  }
}
