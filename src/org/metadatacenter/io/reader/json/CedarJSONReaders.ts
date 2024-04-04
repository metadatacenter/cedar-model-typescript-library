import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { JSONAbstractArtifactReader } from './JSONAbstractArtifactReader';
import { JSONTemplateReader } from './JSONTemplateReader';
import { JSONTemplateElementReader } from './JSONTemplateElementReader';
import { JSONTemplateFieldReader } from './JSONTemplateFieldReader';
import { JSONReaderBehavior } from '../../../behavior/JSONReaderBehavior';

export class CedarJSONReaders {
  private readonly behavior: JSONReaderBehavior;

  private constructor(behavior: JSONReaderBehavior) {
    this.behavior = behavior;
  }

  public static getStrict(): CedarJSONReaders {
    return new CedarJSONReaders(JSONReaderBehavior.STRICT);
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

  public getReaderForArtifactType(cedarArtifactType: CedarArtifactType): JSONAbstractArtifactReader {
    switch (cedarArtifactType) {
      case CedarArtifactType.TEMPLATE:
        return JSONTemplateReader.getStrict();
      case CedarArtifactType.TEMPLATE_ELEMENT:
        return JSONTemplateElementReader.getStrict();
      case CedarArtifactType.TEMPLATE_FIELD:
        return JSONTemplateFieldReader.getStrict();
      case CedarArtifactType.STATIC_TEMPLATE_FIELD:
        return JSONTemplateFieldReader.getStrict();
      default:
        throw new Error(`No JSON reader available for CedarArtifactType: ${cedarArtifactType}`);
    }
  }
}
