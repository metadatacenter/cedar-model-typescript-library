import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { YAMLReaderBehavior } from '../../../behavior/YAMLReaderBehavior';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import YAML from 'yaml';
import { YAMLContainerArtifactReader } from './YAMLContainerArtifactReader';
import { YAMLTemplateElementReaderResult } from './YAMLTemplateElementReaderResult';

export class YAMLTemplateElementReader extends YAMLContainerArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_ELEMENT;

  private constructor(behavior: YAMLReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): YAMLTemplateElementReader {
    return new YAMLTemplateElementReader(YAMLReaderBehavior.STRICT);
  }

  public static getForBehavior(behavior: YAMLReaderBehavior): YAMLTemplateElementReader {
    return new YAMLTemplateElementReader(behavior);
  }

  protected override getElementReader(): YAMLTemplateElementReader {
    return this;
  }

  public readFromString(elementSourceString: string): YAMLTemplateElementReaderResult {
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
  ): YAMLTemplateElementReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const element = TemplateElement.buildEmptyWithNullValues();

    this.readNonReportableAttributes(element, elementSourceObject);
    this.readAnnotations(element, elementSourceObject, parsingResult, topPath);
    super.readAndValidateChildrenInfo(element, elementSourceObject, parsingResult, topPath);

    return new YAMLTemplateElementReaderResult(element, parsingResult, elementSourceObject);
  }

  protected readNonReportableAttributes(element: TemplateElement, elementSourceObject: JsonNode) {
    super.readNonReportableAttributes(element, elementSourceObject);
  }
}
