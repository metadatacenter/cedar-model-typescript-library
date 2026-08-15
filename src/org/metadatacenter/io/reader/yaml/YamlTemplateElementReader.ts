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
import { ReaderUtil } from '../ReaderUtil';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';

export class YamlTemplateElementReader extends YamlContainerArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_ELEMENT;

  private constructor(behavior: YamlReaderBehavior, isCompact: boolean = false) {
    super(behavior, isCompact);
  }

  public static getStrict(): YamlTemplateElementReader {
    return new YamlTemplateElementReader(YamlReaderBehavior.STRICT);
  }

  /**
   * A reader for the compact form, which omits the model version and the rest of what the system
   * records about an artifact. Asking for it is the only way to read that form.
   */
  public static getStrictForCompact(): YamlTemplateElementReader {
    return new YamlTemplateElementReader(YamlReaderBehavior.STRICT, true);
  }

  public static getForBehavior(behavior: YamlReaderBehavior, isCompact: boolean = false): YamlTemplateElementReader {
    return new YamlTemplateElementReader(behavior, isCompact);
  }

  protected override getElementReader(): YamlTemplateElementReader {
    return this;
  }

  public readFromString(elementSourceString: string): YamlTemplateElementReaderResult {
    let elementObject;
    try {
      elementObject = YAML.parse(elementSourceString);
    } catch {
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
    element.instanceTypeSpecification = ReaderUtil.getString(elementSourceObject, YamlKeys.instanceType);
    element.skos_prefLabel = ReaderUtil.getString(elementSourceObject, YamlKeys.prefLabel);
    element.skos_altLabel = ReaderUtil.getFilteredStringList(elementSourceObject, YamlKeys.altLabels);
  }
}
