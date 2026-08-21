import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlAbstractArtifactReader } from './YamlAbstractArtifactReader';
import { YamlTemplateFieldReader } from './YamlTemplateFieldReader';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { ReaderUtil } from '../ReaderUtil';
import { YamlTemplateElementReader } from './YamlTemplateElementReader';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { isSizedStaticField } from '../../../model/cedar/field/static/SizedStaticField';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';
import { CedarFieldType } from '../../../model/cedar/types/cedar-types/CedarFieldType';
import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { ChildDeploymentInfoBuilder } from '../../../model/cedar/deployment/ChildDeploymentInfoBuilder';
import { AbstractDynamicChildDeploymentInfoBuilder } from '../../../model/cedar/deployment/AbstractDynamicChildDeploymentInfoBuilder';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';

export abstract class YamlContainerArtifactReader extends YamlAbstractArtifactReader {
  protected fieldReader: YamlTemplateFieldReader;

  protected constructor(behavior: YamlReaderBehavior, isCompact: boolean = false) {
    super(behavior, isCompact);
    // A child carries the model version in the full form and omits it in the compact one, so the
    // reader that reads the children needs the same answer as the reader of the artifact around them.
    this.fieldReader = YamlTemplateFieldReader.getForBehavior(behavior, isCompact);
  }

  protected abstract getElementReader(): YamlTemplateElementReader;

  protected readAndValidateChildrenInfo(
    container: AbstractContainerArtifact,
    elementSourceObject: JsonNode,
    _parsingResult: YamlArtifactParsingResult,
    path: JsonPath,
  ) {
    const childrenNodeList: JsonNode[] = ReaderUtil.getNodeList(elementSourceObject, YamlKeys.children);
    childrenNodeList.forEach((childNode) => {
      const type = ReaderUtil.getString(childNode, YamlKeys.type);
      const name = ReaderUtil.getString(childNode, YamlKeys.key);
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
        childDeploymentInfo.recommendedValue = ReaderUtil.getBoolean(configuration, YamlKeys.recommended);
        childDeploymentInfo.hidden = ReaderUtil.getBoolean(configuration, YamlKeys.hidden);
        childDeploymentInfo.continuePreviousLine = ReaderUtil.getBoolean(configuration, YamlKeys.continuePreviousLine);
        childDeploymentInfo.valueRecommendationEnabled = ReaderUtil.getBoolean(configuration, YamlKeys.valueRecommendation);

        childDeploymentInfo.iri = ReaderUtil.getString(configuration, YamlKeys.propertyIri);

        if (yamlArtifactType.isField()) {
          const cedarFieldType: CedarFieldType = CedarFieldType.forYamlArtifactType(yamlArtifactType);
          childDeploymentInfo.uiInputType = cedarFieldType.getUiInputType();

          const fieldReadingResult = this.fieldReader.readFromObject(childNode, childDeploymentInfo, path.add(YamlKeys.children, name));

          // A child's display size is written by its parent, into `configuration`, so it is read back
          // from there. The field readers take it from the field's own keys, which is where a field
          // written standalone carries it.
          if (isSizedStaticField(fieldReadingResult.field)) {
            fieldReadingResult.field.width = ReaderUtil.getNumber(configuration, YamlKeys.width);
            fieldReadingResult.field.height = ReaderUtil.getNumber(configuration, YamlKeys.height);
          }

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
              .withContinuePreviousLine(childDeploymentInfo.continuePreviousLine)
              .withRecommendedValue(childDeploymentInfo.recommendedValue)
              .withRequiredValue(childDeploymentInfo.requiredValue)
              .withValueRecommendationEnabled(childDeploymentInfo.valueRecommendationEnabled);
            if (finalChildInfoBuilder2 instanceof ChildDeploymentInfoBuilder) {
              finalChildInfoBuilder2
                .withMultiInstance(childDeploymentInfo.multiInstance)
                .withMinItems(childDeploymentInfo.minItems)
                .withMaxItems(childDeploymentInfo.maxItems);
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
        } else {
          // A child whose type this library does not know used to be skipped, leaving a container
          // that read successfully with a child missing. The Java library refuses it.
          throw new Error(`Unknown child type "${type}" at ${path.add(YamlKeys.children, name).toString()}`);
        }
      } else {
        // A child with no key cannot be deployed into a container, and dropping it silently loses a
        // field the document declared.
        throw new Error(`A child without a ${YamlKeys.key} at ${path.add(YamlKeys.children).toString()}`);
      }
    });
  }
}
