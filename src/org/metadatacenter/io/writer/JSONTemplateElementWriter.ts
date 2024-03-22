import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { ReaderUtil } from '../reader/ReaderUtil';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { CedarArtifactType } from '../../model/cedar/types/cedar-types/CedarArtifactType';
import { JavascriptType } from '../../model/cedar/types/wrapped-types/JavascriptType';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { ArtifactSchema } from '../../model/cedar/types/wrapped-types/ArtifactSchema';
import { CedarWriters } from './CedarWriters';
import { JSONTemplateFieldContentDynamic } from '../../model/cedar/util/serialization/JSONTemplateFieldContentDynamic';
import { TemplateElement } from '../../model/cedar/element/TemplateElement';
import { JSONElementContent } from '../../model/cedar/util/serialization/JSONElementContent';
import { JSONAbstractContainerArtifactWriter } from './JSONAbstractContainerArtifactWriter';

export class JSONTemplateElementWriter extends JSONAbstractContainerArtifactWriter {
  private constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: JSONWriterBehavior, writers: CedarWriters): JSONTemplateElementWriter {
    return new JSONTemplateElementWriter(behavior, writers);
  }

  private buildProperties(element: TemplateElement): JsonNode {
    // clone, because we will need to modify deep content
    const properties = ReaderUtil.deepClone(JSONElementContent.PROPERTIES_PARTIAL);

    // Include the IRI mapping
    properties[JsonSchema.atContext][JsonSchema.properties] = {
      ...properties[JsonSchema.atContext][JsonSchema.properties],
      ...element.getChildrenInfo().getNonStaticNonAttributeValueIRIMap(),
    };

    const childNamesForRequired: string[] = element.getChildrenInfo().getChildrenNamesForRequired();

    // Omit required if empty
    if (childNamesForRequired.length > 0) {
      properties[JsonSchema.atContext][JsonSchema.required] = [
        ...properties[JsonSchema.atContext][JsonSchema.required],
        ...childNamesForRequired,
      ];
    } else {
      ReaderUtil.deleteNodeKey(properties[JsonSchema.atContext], JsonSchema.required);
    }

    // Attribute value modification
    if (element.getChildrenInfo().hasAttributeValue()) {
      properties[JsonSchema.atContext][TemplateProperty.additionalProperties] =
        JSONTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
    }

    // include the field/element definitions
    return {
      ...properties,
      ...this.getChildMapAsJSON(element),
    } as JsonNode;
  }

  public getAsJsonString(element: TemplateElement, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(element), null, indent);
  }

  public getAsJsonNode(element: TemplateElement): JsonNode {
    const extendedProperties: JsonNode = this.buildProperties(element);

    const elementUi: JsonNode = {
      [CedarModel.order]: element.getChildrenInfo().getChildrenNames(),
      [CedarModel.propertyLabels]: element.getChildrenInfo().getPropertyLabelMap(),
      [CedarModel.propertyDescriptions]: element.getChildrenInfo().getPropertyDescriptionMap(),
    };

    // build the final object
    return {
      [JsonSchema.atId]: this.atomicWriter.write(element.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(CedarArtifactType.TEMPLATE_ELEMENT),
      [JsonSchema.atContext]: JSONElementContent.CONTEXT_VERBATIM,
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: element.title,
      [TemplateProperty.description]: element.description,
      [CedarModel.ui]: elementUi,
      [JsonSchema.properties]: extendedProperties,
      [JsonSchema.required]: [...JSONElementContent.REQUIRED_PARTIAL, ...element.getChildrenInfo().getChildrenNamesForRequired()],
      ...this.macroSchemaNameAndDescription(element),
      ...this.macroProvenance(element, this.atomicWriter),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(element.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(element.getAdditionalProperties()),
      ...this.macroStatusAndVersion(element, this.atomicWriter),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
      ...this.macroDerivedFrom(element),
    };
  }
}
