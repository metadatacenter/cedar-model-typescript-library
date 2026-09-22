import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlAbstractArtifactReader } from './YamlAbstractArtifactReader';
import { YamlTemplateFieldReader } from './YamlTemplateFieldReader';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { ChildDeploymentInfoElement } from '../../../model/cedar/deployment/ChildDeploymentInfoElement';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { ReaderUtil } from '../ReaderUtil';
import { YamlTemplateElementReader } from './YamlTemplateElementReader';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { isSizedStaticField } from '../../../model/cedar/field/static/SizedStaticField';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';
import { CedarFieldType } from '../../../model/cedar/types/cedar-types/CedarFieldType';
import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { ChildDeploymentInfoAlwaysMultipleBuilder } from '../../../model/cedar/deployment/ChildDeploymentInfoAlwaysMultipleBuilder';
import { ChildDeploymentInfoStaticBuilder } from '../../../model/cedar/deployment/ChildDeploymentInfoStaticBuilder';
import { ChildDeploymentInfoBuilder } from '../../../model/cedar/deployment/ChildDeploymentInfoBuilder';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';
import { AbstractFieldChildDeploymentInfoBuilder } from '../../../model/cedar/deployment/AbstractFieldChildDeploymentInfoBuilder';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';
import { NullableString } from '../../../model/cedar/types/basic-types/NullableString';

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
          // `multiple: true` carrying no bound is how the writer spells the default: it leaves out
          // a lower bound equal to the one the model supplies for such a child. Restoring it here
          // is what inverts that, so a template read from YAML says what the same template read
          // from JSON says - the JSON form always carries the number. An omitted bound in JSON is
          // a different statement, that there is no floor, and stays one.
          childDeploymentInfo.minItems =
            ReaderUtil.getNumber(configuration, YamlKeys.minItems) ?? AbstractChildDeploymentInfo.defaultMinItems;
          childDeploymentInfo.maxItems = ReaderUtil.getNumber(configuration, YamlKeys.maxItems);
        }
        childDeploymentInfo.requiredValue = ReaderUtil.getBoolean(configuration, YamlKeys.required);
        childDeploymentInfo.recommendedValue = ReaderUtil.getBoolean(configuration, YamlKeys.recommended);
        childDeploymentInfo.hidden = ReaderUtil.getBoolean(configuration, YamlKeys.hidden);
        childDeploymentInfo.valueRecommendationEnabled = ReaderUtil.getBoolean(configuration, YamlKeys.valueRecommendation);
        /*
         * A line placement is a dynamic field's, so the field branch reads it and no other branch
         * does. A document stating it for an element states something the CEDAR model has nowhere
         * to keep — an element's `_ui` admits its order, property labels and property descriptions
         * and refuses anything else — and the Java library has always read past it. Reading it into
         * the model here is what let the YAML writer put it back while the JSON writer dropped it.
         */

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

          // The container's entry for this child, restored where the document leaves it out.
          childDeploymentInfo.label = YamlContainerArtifactReader.entryFor(childDeploymentInfo.label, fieldReadingResult.field.schema_name);
          childDeploymentInfo.description = YamlContainerArtifactReader.entryFor(
            childDeploymentInfo.description,
            fieldReadingResult.field.schema_description,
          );

          const finalChildInfoBuilder = fieldReadingResult.field
            .createDeploymentBuilder(childDeploymentInfo.name)
            .withLabel(childDeploymentInfo.label)
            .withDescription(childDeploymentInfo.description);
          if (finalChildInfoBuilder instanceof ChildDeploymentInfoStaticBuilder) {
            finalChildInfoBuilder.withHidden(childDeploymentInfo.hidden);
          }

          if (childDeploymentInfo.atType === CedarArtifactType.TEMPLATE_FIELD) {
            const finalChildInfoBuilder2: AbstractFieldChildDeploymentInfoBuilder =
              finalChildInfoBuilder as AbstractFieldChildDeploymentInfoBuilder;
            finalChildInfoBuilder2
              .withHidden(childDeploymentInfo.hidden)
              .withIri(childDeploymentInfo.iri)
              .withContinuePreviousLine(ReaderUtil.getBoolean(configuration, YamlKeys.continuePreviousLine))
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
          if (finalChildInfoBuilder instanceof ChildDeploymentInfoAlwaysMultipleBuilder) {
            finalChildInfoBuilder
              .withMinItems(ReaderUtil.getNumber(configuration, YamlKeys.minItems))
              .withMaxItems(ReaderUtil.getNumber(configuration, YamlKeys.maxItems));
          }
          const finalChildInfo = finalChildInfoBuilder.build();
          container.addChild(fieldReadingResult.field, finalChildInfo);
        } else if (yamlArtifactType.isElement()) {
          const elementReadingResult = this.getElementReader().readFromObject(
            childNode,
            childDeploymentInfo,
            path.add(YamlKeys.children, name),
          );
          const elementChildInfo: ChildDeploymentInfoElement = elementReadingResult.element
            .createDeploymentBuilder(name)
            .withLabel(YamlContainerArtifactReader.entryFor(childDeploymentInfo.label, elementReadingResult.element.schema_name))
            .withDescription(
              YamlContainerArtifactReader.entryFor(childDeploymentInfo.description, elementReadingResult.element.schema_description),
            )
            .withIri(childDeploymentInfo.iri)
            .withMultiInstance(childDeploymentInfo.multiInstance)
            .withMinItems(childDeploymentInfo.minItems)
            .withMaxItems(childDeploymentInfo.maxItems)
            .build();
          container.addChild(elementReadingResult.element, elementChildInfo);
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

  /**
   * What the container says about a child, given what the document states and what the child says
   * about itself.
   *
   * A container carries a label and a description for each of its children, and YAML writes one
   * only where it differs from the child's own, since an `overrideLabel` repeating the child's name
   * would state that name twice. Reading the absence as though the container had said nothing loses
   * the entry rather than the repetition, and a template written as YAML and read back came out as
   * JSON with a thinner `_ui` than the JSON it was made from. So the child's own value stands in
   * wherever the document overrides nothing, which is what the Java library's YAML reader does, and
   * what makes the two return the same model from the same document.
   */
  private static entryFor(override: NullableString, own: NullableString): NullableString {
    return override !== null ? override : own;
  }
}
