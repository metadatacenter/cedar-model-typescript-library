import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
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

    // Include the IRI mapping. The context may require exactly the terms it declares: a child with
    // no property IRI has no term yet, so the repository will add both when it assigns the IRI.
    const childIriMap = element.getChildrenInfo().getIRIMap();
    properties[JsonSchema.atContext][JsonSchema.properties] = {
      ...properties[JsonSchema.atContext][JsonSchema.properties],
      ...childIriMap,
    };

    const childNamesForRequired: string[] = element.getChildrenInfo().getChildNamesWithIri();

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
    const extendedProperties = {
      ...properties,
      ...this.getChildMapAsJson(element),
    };

    this.expandInstanceTypeSpecification(element, extendedProperties);

    return extendedProperties;
  }

  public getAsJsonString(element: TemplateElement, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(element), null, indent);
  }

  public getAsJsonNode(element: TemplateElement): JsonNode {
    const extendedProperties: JsonNode = this.buildProperties(element);

    const elementUi: JsonNode = {
      [CedarModel.order]: element.getChildrenInfo().getChildrenNames(),
      [CedarModel.propertyLabels]: element.getChildrenInfo().getPropertyLabelMap(element),
      [CedarModel.propertyDescriptions]: element.getChildrenInfo().getPropertyDescriptionMap(element),
    };
    if (element.header !== null) {
      elementUi[CedarModel.header] = element.header;
    }
    if (element.footer !== null) {
      elementUi[CedarModel.footer] = element.footer;
    }

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
      ...this.macroAnnotations(element),
      ...this.macroSchemaNameAndDescription(element),
      ...this.macroProvenance(element, this.atomicWriter),
      ...this.macroSkos(element),
      ...this.macroStatusAndVersion(element, this.atomicWriter),
      ...this.macroDerivedFrom(element),
      ...this.macroPreviousVersion(element),
      // The model version names the model the rendering conforms to, so it is the writer's to state
      // and not the document's to carry forward. Preserving a stored one republished an assertion
      // about a model this library no longer emits; the YAML writer has always stamped it.
      [JsonSchema.schemaVersion]: this.atomicWriter.write(SchemaVersion.CURRENT),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(element.getAdditionalProperties()),
      ...this.macroSchemaIdentifier(element),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
    };
  }
}
