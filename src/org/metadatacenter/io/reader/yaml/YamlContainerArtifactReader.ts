import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlAbstractArtifactReader } from './YamlAbstractArtifactReader';
import { YamlTemplateFieldReader } from './YamlTemplateFieldReader';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { ReaderUtil } from '../ReaderUtil';
import { YamlTemplateElementReader } from './YamlTemplateElementReader';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';
import { CedarFieldType } from '../../../model/cedar/types/cedar-types/CedarFieldType';
import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { ChildDeploymentInfoBuilder } from '../../../model/cedar/deployment/ChildDeploymentInfoBuilder';
import { AbstractDynamicChildDeploymentInfoBuilder } from '../../../model/cedar/deployment/AbstractDynamicChildDeploymentInfoBuilder';

export abstract class YamlContainerArtifactReader extends YamlAbstractArtifactReader {
  protected fieldReader: YamlTemplateFieldReader;

  protected constructor(behavior: YamlReaderBehavior) {
    super(behavior);
    this.fieldReader = YamlTemplateFieldReader.getForBehavior(behavior);
  }

  protected abstract getElementReader(): YamlTemplateElementReader;

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

          const finalChildInfoBuilder = fieldReadingResult.field
            .createDeploymentBuilder(childDeploymentInfo.name)
            .withLabel(childDeploymentInfo.label)
            .withDescription(childDeploymentInfo.description);

          if (childDeploymentInfo.atType === CedarArtifactType.TEMPLATE_FIELD) {
            const finalChildInfoBuilder2: AbstractDynamicChildDeploymentInfoBuilder =
              finalChildInfoBuilder as AbstractDynamicChildDeploymentInfoBuilder;
            finalChildInfoBuilder2
              .withIri(childDeploymentInfo.iri)
              .withHidden(childDeploymentInfo.hidden)
              .withRequiredValue(childDeploymentInfo.requiredValue);
            if (finalChildInfoBuilder2 instanceof ChildDeploymentInfoBuilder) {
              const currentInfo = childDeploymentInfo as any as ChildDeploymentInfo;
              finalChildInfoBuilder2
                .withMultiInstance(currentInfo.multiInstance)
                .withMinItems(currentInfo.minItems)
                .withMaxItems(currentInfo.maxItems);
            }
          }
          const finalChildInfo = finalChildInfoBuilder.build();
          container.addChild(fieldReadingResult.field, finalChildInfo);
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
