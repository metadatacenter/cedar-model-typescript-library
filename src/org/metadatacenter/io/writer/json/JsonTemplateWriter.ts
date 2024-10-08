import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { Template } from '../../../model/cedar/template/Template';
import { ReaderUtil } from '../../reader/ReaderUtil';
import { JsonTemplateContent } from '../../../model/cedar/util/serialization/JsonTemplateContent';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JavascriptType } from '../../../model/cedar/types/wrapped-types/JavascriptType';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { ArtifactSchema } from '../../../model/cedar/types/wrapped-types/ArtifactSchema';
import { JsonTemplateFieldContentDynamic } from '../../../model/cedar/util/serialization/JsonTemplateFieldContentDynamic';
import { JsonAbstractContainerArtifactWriter } from './JsonAbstractContainerArtifactWriter';
import { CedarJsonWriters } from './CedarJsonWriters';
import { Language } from '../../../model/cedar/types/wrapped-types/Language';

export class JsonTemplateWriter extends JsonAbstractContainerArtifactWriter {
  private constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: JsonWriterBehavior, writers: CedarJsonWriters): JsonTemplateWriter {
    return new JsonTemplateWriter(behavior, writers);
  }

  private buildProperties(template: Template): JsonNode {
    // clone, because we will need to modify deep content
    const properties = ReaderUtil.deepClone(JsonTemplateContent.PROPERTIES_PARTIAL);

    // @language
    if (template.language !== Language.NULL) {
      properties[JsonSchema.atContext][JsonSchema.atLanguage] = this.atomicWriter.write(template.language);
    }

    // Include the IRI mapping
    properties[JsonSchema.atContext][JsonSchema.properties] = {
      ...properties[JsonSchema.atContext][JsonSchema.properties],
      ...template.getChildrenInfo().getIRIMap(),
    };

    const requiredChildren: string[] = template.getChildrenInfo().getChildrenNamesForRequiredInProperties();

    properties[JsonSchema.atContext][JsonSchema.required] = [...properties[JsonSchema.atContext][JsonSchema.required], ...requiredChildren];

    // Attribute value modification
    if (template.getChildrenInfo().hasAttributeValue()) {
      properties[JsonSchema.atContext][TemplateProperty.additionalProperties] =
        JsonTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
    }

    // include the field/element definitions
    const extendedProperties = {
      ...properties,
      ...this.getChildMapAsJson(template),
    };

    this.expandInstanceTypeSpecification(template, extendedProperties);

    return extendedProperties;
  }

  public getAsJsonString(template: Template, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(template), null, indent);
  }

  public getAsJsonNode(template: Template): JsonNode {
    const extendedProperties: JsonNode = this.buildProperties(template);

    const templateUI: JsonNode = {
      [CedarModel.order]: template.getChildrenInfo().getChildrenNames(),
      [CedarModel.propertyLabels]: template.getChildrenInfo().getPropertyLabelMap(template),
      [CedarModel.propertyDescriptions]: template.getChildrenInfo().getPropertyDescriptionMap(template),
    };
    if (this.behavior.outputPages()) {
      templateUI[CedarModel.pages] = [];
    }

    if (template.header !== null) {
      templateUI[CedarModel.header] = template.header;
    }
    if (template.footer !== null) {
      templateUI[CedarModel.footer] = template.footer;
    }

    // build the final object
    return {
      [JsonSchema.atId]: this.atomicWriter.write(template.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(CedarArtifactType.TEMPLATE),
      [JsonSchema.atContext]: this.macroContext(template),
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: template.title,
      [TemplateProperty.description]: template.description,
      [CedarModel.ui]: templateUI,
      [JsonSchema.properties]: extendedProperties,
      [JsonSchema.required]: [...JsonTemplateContent.REQUIRED_PARTIAL, ...template.getChildrenInfo().getChildrenNamesForRequired()],
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(template.getAdditionalProperties()),
      ...this.macroAnnotations(template),
      ...this.macroSchemaNameAndDescription(template),
      ...this.macroProvenance(template, this.atomicWriter),
      ...this.macroStatusAndVersion(template, this.atomicWriter),
      ...this.macroDerivedFrom(template),
      ...this.macroPreviousVersion(template),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(template.schema_schemaVersion),
      ...this.macroSchemaIdentifier(template),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
    };
  }
}
