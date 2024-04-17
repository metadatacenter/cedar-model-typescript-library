import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonAbstractInstanceArtifactReader } from './JsonAbstractInstanceArtifactReader';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';
import { JsonTemplateInstanceReaderResult } from './JsonTemplateInstanceReaderResult';

export class JsonTemplateInstanceReader extends JsonAbstractInstanceArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_INSTANCE;

  private constructor(behavior: JsonReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): JsonTemplateInstanceReader {
    return new JsonTemplateInstanceReader(JsonReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JsonTemplateInstanceReader {
    return new JsonTemplateInstanceReader(JsonReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JsonReaderBehavior): JsonTemplateInstanceReader {
    return new JsonTemplateInstanceReader(behavior);
  }

  public readFromString(instanceSourceString: string): JsonTemplateInstanceReaderResult {
    let instanceObject;
    try {
      instanceObject = JSON.parse(instanceSourceString);
    } catch (Exception) {
      instanceObject = {};
    }
    return this.readFromObject(instanceObject, new JsonPath());
  }

  public readFromObject(instanceSourceObject: JsonNode, _topPath: JsonPath): JsonTemplateInstanceReaderResult {
    const parsingResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
    const instance = TemplateInstance.buildEmptyWithNullValues();

    this.readNonReportableAttributes(instance, instanceSourceObject);

    return new JsonTemplateInstanceReaderResult(instance, parsingResult, instanceSourceObject);
  }
}
