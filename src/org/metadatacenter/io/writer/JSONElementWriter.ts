import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { CedarTemplate } from '../../model/cedar/template/CedarTemplate';
import { ReaderUtil } from '../reader/ReaderUtil';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { CedarArtifactType } from '../../model/cedar/types/beans/CedarArtifactType';
import { JavascriptType } from '../../model/cedar/types/beans/JavascriptType';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { CedarSchema } from '../../model/cedar/types/beans/CedarSchema';
import { CedarWriters } from './CedarWriters';
import { CedarJSONTemplateFieldContentDynamic } from '../../model/cedar/util/serialization/CedarJSONTemplateFieldContentDynamic';
import { CedarElement } from '../../model/cedar/element/CedarElement';
import { CedarJSONElementContent } from '../../model/cedar/util/serialization/CedarJSONElementContent';
import { JSONAbstractContainerArtifactWriter } from './JSONAbstractContainerArtifactWriter';

export class JSONElementWriter extends JSONAbstractContainerArtifactWriter {
  private constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: JSONWriterBehavior, writers: CedarWriters): JSONElementWriter {
    return new JSONElementWriter(behavior, writers);
  }

  private buildProperties(element: CedarElement): JsonNode {
    // clone, because we will need to modify deep content
    const properties = ReaderUtil.deepClone(CedarJSONElementContent.PROPERTIES_PARTIAL);

    // Include the IRI mapping
    properties[JsonSchema.atContext][JsonSchema.properties] = {
      ...properties[JsonSchema.atContext][JsonSchema.properties],
      ...element.childrenInfo.getNonStaticNonAttributeValueIRIMap(),
    };

    // Omit required if empty
    const childNamesForRequired = element.childrenInfo.getChildrenNamesForRequired();
    if (childNamesForRequired.length > 0) {
      properties[JsonSchema.atContext][JsonSchema.required] = [
        ...properties[JsonSchema.atContext][JsonSchema.required],
        ...childNamesForRequired,
      ];
    } else {
      ReaderUtil.deleteNodeKey(properties[JsonSchema.atContext], JsonSchema.required);
    }

    // Attribute value modification
    if (element.childrenInfo.hasAttributeValue()) {
      properties[JsonSchema.atContext][TemplateProperty.additionalProperties] =
        CedarJSONTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
    }

    // include the field/element definitions
    const extendedProperties = {
      ...properties,
      ...this.getChildMapAsJSON(element),
    };

    return extendedProperties;
  }

  public getAsJsonString(template: CedarTemplate, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(template), null, indent);
  }

  public getAsJsonNode(element: CedarElement): JsonNode {
    const extendedProperties: JsonNode = this.buildProperties(element);

    const elementUi: JsonNode = {
      [CedarModel.order]: element.childrenInfo.getChildrenNames(),
      [CedarModel.propertyLabels]: element.childrenInfo.getPropertyLabelMap(),
      [CedarModel.propertyDescriptions]: element.childrenInfo.getPropertyDescriptionMap(),
    };
    // if (JSONTemplateReader.getBehavior() == JSONTemplateReader.FEBRUARY_2024) {
    //   templateUI[CedarModel.pages] = [];
    // }

    // build the final object
    return {
      [JsonSchema.atId]: this.atomicWriter.write(element.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(CedarArtifactType.TEMPLATE_ELEMENT),
      [JsonSchema.atContext]: CedarJSONElementContent.CONTEXT_VERBATIM,
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: element.title,
      [TemplateProperty.description]: element.description,
      [CedarModel.ui]: elementUi,
      [JsonSchema.properties]: extendedProperties,
      [JsonSchema.required]: [...CedarJSONElementContent.REQUIRED_PARTIAL, ...element.childrenInfo.getChildrenNamesForRequired()],
      ...this.macroSchemaNameAndDescription(element),
      ...this.macroProvenance(element, this.atomicWriter),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(element.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(element.getAdditionalProperties()),
      ...this.macroStatusAndVersion(element, this.atomicWriter),
      [CedarModel.schema]: this.atomicWriter.write(CedarSchema.CURRENT),
    };
  }
}
