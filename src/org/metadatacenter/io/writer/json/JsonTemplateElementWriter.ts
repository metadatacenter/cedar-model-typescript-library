import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { ReaderUtil } from '../../reader/ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JavascriptType } from '../../../model/cedar/types/wrapped-types/JavascriptType';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { ArtifactSchema } from '../../../model/cedar/types/wrapped-types/ArtifactSchema';
import { JsonTemplateFieldContentDynamic } from '../../../model/cedar/util/serialization/JsonTemplateFieldContentDynamic';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { JsonTemplateElementContent } from '../../../model/cedar/util/serialization/JsonTemplateElementContent';
import { JsonAbstractContainerArtifactWriter } from './JsonAbstractContainerArtifactWriter';
import { CedarJsonWriters } from './CedarJsonWriters';
import { Language } from '../../../model/cedar/types/wrapped-types/Language';

export class JsonTemplateElementWriter extends JsonAbstractContainerArtifactWriter {
  private constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: JsonWriterBehavior, writers: CedarJsonWriters): JsonTemplateElementWriter {
    return new JsonTemplateElementWriter(behavior, writers);
  }

  private buildProperties(element: TemplateElement): JsonNode {
    // clone, because we will need to modify deep content
    const properties = ReaderUtil.deepClone(JsonTemplateElementContent.PROPERTIES_PARTIAL);

    // @language
    if (element.language !== Language.NULL) {
      properties[JsonSchema.atContext][JsonSchema.atLanguage] = this.atomicWriter.write(element.language);
    }

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
        JsonTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
    }

    // include the field/element definitions
    return {
      ...properties,
      ...this.getChildMapAsJson(element),
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
      [JsonSchema.atContext]: this.macroContext(element),
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: element.title,
      [TemplateProperty.description]: element.description,
      [CedarModel.ui]: elementUi,
      [JsonSchema.properties]: extendedProperties,
      [JsonSchema.required]: [...JsonTemplateElementContent.REQUIRED_PARTIAL, ...element.getChildrenInfo().getChildrenNamesForRequired()],
      ...this.macroSchemaNameAndDescription(element),
      ...this.macroProvenance(element, this.atomicWriter),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(element.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(element.getAdditionalProperties()),
      ...this.macroStatusAndVersion(element, this.atomicWriter),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
      ...this.macroSchemaIdentifier(element),
      ...this.macroDerivedFrom(element),
      ...this.macroPreviousVersion(element),
      ...this.macroAnnotations(element),
    };
  }
}
