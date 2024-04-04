import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { JSONReaderBehavior } from '../../../behavior/JSONReaderBehavior';
import { JSONTemplateElementReaderResult } from './JSONTemplateElementReaderResult';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { JSONAbstractInstanceArtifactReader } from './JSONAbstractInstanceArtifactReader';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';
import { JSONTemplateInstanceReaderResult } from './JSONTemplateInstanceReaderResult';

export class JSONTemplateInstanceReader extends JSONAbstractInstanceArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_INSTANCE;

  private constructor(behavior: JSONReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): JSONTemplateInstanceReader {
    return new JSONTemplateInstanceReader(JSONReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JSONTemplateInstanceReader {
    return new JSONTemplateInstanceReader(JSONReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JSONReaderBehavior): JSONTemplateInstanceReader {
    return new JSONTemplateInstanceReader(behavior);
  }

  public readFromString(instanceSourceString: string): JSONTemplateInstanceReaderResult {
    let instanceObject;
    try {
      instanceObject = JSON.parse(instanceSourceString);
    } catch (Exception) {
      instanceObject = {};
    }
    return this.readFromObject(instanceObject, new JsonPath());
  }

  public readFromObject(instanceSourceObject: JsonNode, _topPath: JsonPath): JSONTemplateInstanceReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const instance = TemplateInstance.buildEmptyWithNullValues();

    this.readNonReportableAttributes(instance, instanceSourceObject);

    return new JSONTemplateInstanceReaderResult(instance, parsingResult, instanceSourceObject);
  }
}
