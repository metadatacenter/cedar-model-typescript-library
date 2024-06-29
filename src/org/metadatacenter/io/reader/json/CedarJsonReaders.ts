import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { JsonTemplateReader } from './JsonTemplateReader';
import { JsonTemplateElementReader } from './JsonTemplateElementReader';
import { JsonTemplateFieldReaderInternal } from './JsonTemplateFieldReaderInternal';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonTemplateInstanceReader } from './JsonTemplateInstancetReader';
import { JsonAbstractArtifactReader } from './JsonAbstractArtifactReader';

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
      artifactJSON = JSON.parse(artifactSource);
    } else {
      artifactJSON = artifactSource;
    }
    if (artifactJSON && artifactJSON['@type']) {
      const atType: string | null = ReaderUtil.getString(artifactJSON, JsonSchema.atType);
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
        return JsonTemplateFieldReaderInternal.getStrict();
      case CedarArtifactType.STATIC_TEMPLATE_FIELD:
        return JsonTemplateFieldReaderInternal.getStrict();
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

  public getTemplateFieldReader(): JsonTemplateFieldReaderInternal {
    return JsonTemplateFieldReaderInternal.getForBehavior(this.behavior);
  }

  public getTemplateInstanceReader(): JsonTemplateInstanceReader {
    return JsonTemplateInstanceReader.getForBehavior(this.behavior);
  }
}
