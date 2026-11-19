import { JsonSourcePolicy } from '../../../policy/JsonSourcePolicy';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { ElementInstance } from '../../../model/cedar/template-instance/ElementInstance';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { ReaderUtil } from '../ReaderUtil';
import { JsonAbstractArtifactReader } from './JsonAbstractArtifactReader';
import { JsonTemplateInstanceReader } from './JsonTemplateInstanceReader';
import { JsonElementInstanceReaderResult } from './JsonElementInstanceReaderResult';

/**
 * Read an element instance that stands on its own, as Java's `JsonArtifactReader.readElementInstanceArtifact`
 * reads one. Its JSON is the object a template instance holds for a nested element: `@context`, `@id`,
 * `@type` and its children. It may also state a name, a description and the four provenance keys. It
 * names no template, so nothing here asks for `schema:isBasedOn`.
 */
export class JsonElementInstanceReader extends JsonAbstractArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.ELEMENT_INSTANCE;
  private readonly dataReader: JsonTemplateInstanceReader;

  private constructor(behavior: JsonReaderBehavior) {
    super(behavior);
    this.dataReader = JsonTemplateInstanceReader.getForBehavior(behavior);
  }

  public static getStrict(): JsonElementInstanceReader {
    return new JsonElementInstanceReader(JsonReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JsonElementInstanceReader {
    return new JsonElementInstanceReader(JsonReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JsonReaderBehavior): JsonElementInstanceReader {
    return new JsonElementInstanceReader(behavior);
  }

  public readFromString(instanceSourceString: string): JsonElementInstanceReaderResult {
    return this.readFromObject(JsonSourcePolicy.parse(instanceSourceString), new JsonPath());
  }

  public readFromObject(instanceSourceObject: JsonNode, topPath?: JsonPath): JsonElementInstanceReaderResult {
    if (instanceSourceObject === null || typeof instanceSourceObject !== 'object' || Array.isArray(instanceSourceObject)) {
      throw new Error('An element instance must be a JSON object.');
    }
    const parsingResult = new JsonArtifactParsingResult();
    const instance = ElementInstance.buildEmptyWithNullValues();
    this.readNonReportableAttributes(instance, instanceSourceObject);
    instance.descriptionWasAbsent = ReaderUtil.getString(instanceSourceObject, JsonSchema.schemaDescription) === null;
    instance.dataContainer = this.dataReader.readElementInstanceData(instanceSourceObject, topPath ?? new JsonPath(), parsingResult);
    // The identifier is the occurrence's, which the data reader has held to the identifier rules.
    instance.at_id = CedarArtifactId.forValue(instance.dataContainer.id);
    return new JsonElementInstanceReaderResult(instance, parsingResult, instanceSourceObject);
  }
}
