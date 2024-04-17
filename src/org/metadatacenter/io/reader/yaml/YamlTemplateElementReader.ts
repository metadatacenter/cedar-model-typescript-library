import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import YAML from 'yaml';
import { YamlContainerArtifactReader } from './YamlContainerArtifactReader';
import { YamlTemplateElementReaderResult } from './YamlTemplateElementReaderResult';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';

export class YamlTemplateElementReader extends YamlContainerArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_ELEMENT;

  private constructor(behavior: YamlReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): YamlTemplateElementReader {
    return new YamlTemplateElementReader(YamlReaderBehavior.STRICT);
  }

  public static getForBehavior(behavior: YamlReaderBehavior): YamlTemplateElementReader {
    return new YamlTemplateElementReader(behavior);
  }

  protected override getElementReader(): YamlTemplateElementReader {
    return this;
  }

  public readFromString(elementSourceString: string): YamlTemplateElementReaderResult {
    let elementObject;
    try {
      elementObject = YAML.parse(elementSourceString);
    } catch (Exception) {
      elementObject = {};
    }
    return this.readFromObject(elementObject, ChildDeploymentInfo.empty(), new JsonPath());
  }

  public readFromObject(
    elementSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    topPath: JsonPath,
  ): YamlTemplateElementReaderResult {
    const parsingResult: YamlArtifactParsingResult = new YamlArtifactParsingResult();
    const element = TemplateElement.buildEmptyWithNullValues();

    this.readNonReportableAttributes(element, elementSourceObject);
    this.readAnnotations(element, elementSourceObject, parsingResult, topPath);
    super.readAndValidateChildrenInfo(element, elementSourceObject, parsingResult, topPath);

    return new YamlTemplateElementReaderResult(element, parsingResult, elementSourceObject);
  }

  protected readNonReportableAttributes(element: TemplateElement, elementSourceObject: JsonNode) {
    super.readNonReportableAttributes(element, elementSourceObject);
  }
}
