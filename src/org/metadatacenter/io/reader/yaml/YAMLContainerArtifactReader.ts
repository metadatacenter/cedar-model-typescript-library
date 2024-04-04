import { YAMLReaderBehavior } from '../../../behavior/YAMLReaderBehavior';
import { YAMLAbstractArtifactReader } from './YAMLAbstractArtifactReader';
import { YAMLTemplateFieldReader } from './YAMLTemplateFieldReader';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { ReaderUtil } from '../ReaderUtil';
import { YAMLTemplateElementReader } from './YAMLTemplateElementReader';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';
import { CedarFieldType } from '../../../model/cedar/types/cedar-types/CedarFieldType';
import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';

export abstract class YAMLContainerArtifactReader extends YAMLAbstractArtifactReader {
  protected fieldReader: YAMLTemplateFieldReader;

  protected constructor(behavior: YAMLReaderBehavior) {
    super(behavior);
    this.fieldReader = YAMLTemplateFieldReader.getForBehavior(behavior);
  }

  protected abstract getElementReader(): YAMLTemplateElementReader;

  protected readAndValidateChildrenInfo(
    container: AbstractContainerArtifact,
    elementSourceObject: JsonNode,
    _parsingResult: ParsingResult,
    path: JsonPath,
  ) {
    const childrenNodeList: JsonNode[] = ReaderUtil.getNodeList(elementSourceObject, YamlKeys.children);
    childrenNodeList.forEach((childNode) => {
      const type = ReaderUtil.getString(childNode, YamlKeys.type);
      const name = ReaderUtil.getString(childNode, YamlKeys.name);
      const yamlArtifactType = YamlArtifactType.forValue(type);
      if (name !== null) {
        const childDeploymentInfo = new ChildDeploymentInfo(name);
        childDeploymentInfo.atType = CedarArtifactType.forYamlArtifactType(yamlArtifactType);
        const configuration: JsonNode = ReaderUtil.getNode(childNode, YamlKeys.configuration);
        childDeploymentInfo.label = ReaderUtil.getString(configuration, YamlKeys.overrideLabel);
        childDeploymentInfo.description = ReaderUtil.getString(configuration, YamlKeys.overrideDescription);
        childDeploymentInfo.multiInstance = ReaderUtil.getBoolean(configuration, YamlKeys.multiple);
        if (childDeploymentInfo.multiInstance) {
          childDeploymentInfo.minItems = ReaderUtil.getNumber(configuration, YamlKeys.minItems);
          childDeploymentInfo.maxItems = ReaderUtil.getNumber(configuration, YamlKeys.maxItems);
        }
        childDeploymentInfo.requiredValue = ReaderUtil.getBoolean(configuration, YamlKeys.required);
        childDeploymentInfo.hidden = ReaderUtil.getBoolean(configuration, YamlKeys.hidden);

        if (yamlArtifactType !== YamlArtifactType.ATTRIBUTE_VALUE) {
          childDeploymentInfo.iri = ReaderUtil.getString(configuration, YamlKeys.propertyIRI);
        }

        if (yamlArtifactType.isField()) {
          const cedarFieldType: CedarFieldType = CedarFieldType.forYamlArtifactType(yamlArtifactType);
          childDeploymentInfo.uiInputType = cedarFieldType.getUiInputType();

          const fieldReadingResult = this.fieldReader.readFromObject(childNode, childDeploymentInfo, path.add(YamlKeys.children, name));
          container.addChild(fieldReadingResult.field, childDeploymentInfo);
        } else if (yamlArtifactType.isElement()) {
          const elementReadingResult = this.getElementReader().readFromObject(
            childNode,
            childDeploymentInfo,
            path.add(YamlKeys.children, name),
          );
          container.addChild(elementReadingResult.element, childDeploymentInfo);
        }
      }
    });
  }
}
