import { JsonSourcePolicy } from '../../../policy/JsonSourcePolicy';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { JsonTemplateReader } from './JsonTemplateReader';
import { JsonTemplateElementReader } from './JsonTemplateElementReader';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonTemplateInstanceReader } from './JsonTemplateInstanceReader';
import { JsonAbstractArtifactReader } from './JsonAbstractArtifactReader';
import { JsonTemplateFieldReader } from './JsonTemplateFieldReader';

export class CedarJsonReaders {
  private readonly behavior: JsonReaderBehavior;

  private constructor(behavior: JsonReaderBehavior) {
    this.behavior = behavior;
  }

  public static getStrict(): CedarJsonReaders {
    return new CedarJsonReaders(JsonReaderBehavior.STRICT);
  }

  public static getFebruary2024(): CedarJsonReaders {
    return new CedarJsonReaders(JsonReaderBehavior.FEBRUARY_2024);
  }

  public static detectArtifactType(artifactSource: JsonNode | string): CedarArtifactType {
    let artifactJSON: JsonNode;
    if (typeof artifactSource === 'string') {
      artifactJSON = JsonSourcePolicy.parse(artifactSource);
    } else {
      artifactJSON = artifactSource;
    }
    if (artifactJSON && artifactJSON['@type']) {
      // A type given as a list of one is that type, as in Java. A longer list is the reader's to refuse.
      const declared: unknown = artifactJSON[JsonSchema.atType];
      const atType = (Array.isArray(declared) && declared.length === 1 ? declared[0] : declared) as string | null;
      return CedarArtifactType.forValue(atType);
    }
    return CedarArtifactType.NULL;
  }

  public getReaderForArtifactType(cedarArtifactType: CedarArtifactType): JsonAbstractArtifactReader {
    switch (cedarArtifactType) {
      case CedarArtifactType.TEMPLATE:
        return JsonTemplateReader.getStrict();
      case CedarArtifactType.TEMPLATE_ELEMENT:
        return JsonTemplateElementReader.getStrict();
      case CedarArtifactType.TEMPLATE_FIELD:
        return JsonTemplateFieldReader.getStrict();
      case CedarArtifactType.STATIC_TEMPLATE_FIELD:
        return JsonTemplateFieldReader.getStrict();
      case CedarArtifactType.TEMPLATE_INSTANCE:
        return JsonTemplateInstanceReader.getStrict();
      default:
        throw new Error(`No JSON reader available for CedarArtifactType: ${cedarArtifactType}`);
    }
  }

  public getTemplateReader(): JsonTemplateReader {
    return JsonTemplateReader.getForBehavior(this.behavior);
  }

  public getTemplateElementReader(): JsonTemplateElementReader {
    return JsonTemplateElementReader.getForBehavior(this.behavior);
  }

  public getTemplateFieldReader(): JsonTemplateFieldReader {
    return JsonTemplateFieldReader.getForBehavior(this.behavior);
  }

  public getTemplateInstanceReader(): JsonTemplateInstanceReader {
    return JsonTemplateInstanceReader.getForBehavior(this.behavior);
  }
}
