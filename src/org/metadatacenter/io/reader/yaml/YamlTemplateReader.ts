import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { ReaderUtil } from '../ReaderUtil';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { YamlTemplateReaderResult } from './YamlTemplateReaderResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlTemplateElementReader } from './YamlTemplateElementReader';
import { Template } from '../../../model/cedar/template/Template';
import YAML from 'yaml';
import { YamlContainerArtifactReader } from './YamlContainerArtifactReader';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';

export class YamlTemplateReader extends YamlContainerArtifactReader {
  private readonly elementReader: YamlTemplateElementReader;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE;

  private constructor(behavior: YamlReaderBehavior, isCompact: boolean = false) {
    super(behavior, isCompact);
    this.elementReader = YamlTemplateElementReader.getForBehavior(behavior, isCompact);
  }

  public static getStrict(): YamlTemplateReader {
    return new YamlTemplateReader(YamlReaderBehavior.STRICT);
  }

  /**
   * A reader for the compact form, which omits the model version and the rest of what the system
   * records about an artifact. Asking for it is the only way to read that form.
   */
  public static getStrictForCompact(): YamlTemplateReader {
    return new YamlTemplateReader(YamlReaderBehavior.STRICT, true);
  }

  public static getForBehavior(behavior: YamlReaderBehavior, isCompact: boolean = false): YamlTemplateReader {
    return new YamlTemplateReader(behavior, isCompact);
  }

  protected override getElementReader(): YamlTemplateElementReader {
    return this.elementReader;
  }

  public readFromString(templateSourceString: string): YamlTemplateReaderResult {
    let templateObject;
    try {
      templateObject = YAML.parse(templateSourceString);
    } catch {
      templateObject = {};
    }
    return this.readFromObject(templateObject);
  }

  public readFromObject(templateSourceObject: JsonNode, topPath: JsonPath = new JsonPath()): YamlTemplateReaderResult {
    const parsingResult: YamlArtifactParsingResult = new YamlArtifactParsingResult();
    const template = Template.buildEmptyWithNullValues();

    this.readNonReportableAttributes(template, templateSourceObject);
    this.readAnnotations(template, templateSourceObject, parsingResult, topPath);
    this.readInstanceTypeSpecification(template, templateSourceObject, parsingResult);
    this.readAndValidateChildrenInfo(template, templateSourceObject, parsingResult, topPath);

    return new YamlTemplateReaderResult(template, parsingResult, templateSourceObject);
  }

  protected readNonReportableAttributes(template: Template, templateSourceObject: JsonNode) {
    super.readNonReportableAttributes(template, templateSourceObject);
    // Read template-only properties
    template.header = ReaderUtil.getString(templateSourceObject, YamlKeys.header);
    template.footer = ReaderUtil.getString(templateSourceObject, YamlKeys.footer);
  }

  /**
   * The type an instance of this template declares itself to be.
   *
   * A key of its own here. This read the JSON Schema shape the key stands for — an enum of one buried
   * in the `@type` property specification — which no YAML document carries, so a template's instance
   * type was lost on every read.
   */
  private readInstanceTypeSpecification(template: Template, templateSourceObject: JsonNode, _parsingResult: YamlArtifactParsingResult) {
    template.instanceTypeSpecification = ReaderUtil.getString(templateSourceObject, YamlKeys.instanceType);
  }
}
