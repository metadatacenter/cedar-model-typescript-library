import { JSONWriterBehavior } from '../../../behavior/JSONWriterBehavior';
import { Template } from '../../../model/cedar/template/Template';
import { ReaderUtil } from '../../reader/ReaderUtil';
import { JSONTemplateContent } from '../../../model/cedar/util/serialization/JSONTemplateContent';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JavascriptType } from '../../../model/cedar/types/wrapped-types/JavascriptType';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { ArtifactSchema } from '../../../model/cedar/types/wrapped-types/ArtifactSchema';
import { CedarWriters } from '../CedarWriters';
import { JSONTemplateFieldContentDynamic } from '../../../model/cedar/util/serialization/JSONTemplateFieldContentDynamic';
import { JSONAbstractContainerArtifactWriter } from './JSONAbstractContainerArtifactWriter';

export class JSONTemplateWriter extends JSONAbstractContainerArtifactWriter {
  private constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: JSONWriterBehavior, writers: CedarWriters): JSONTemplateWriter {
    return new JSONTemplateWriter(behavior, writers);
  }

  private buildProperties(template: Template): JsonNode {
    // clone, because we will need to modify deep content
    const properties = ReaderUtil.deepClone(JSONTemplateContent.PROPERTIES_PARTIAL);

    // Include the IRI mapping
    properties[JsonSchema.atContext][JsonSchema.properties] = {
      ...properties[JsonSchema.atContext][JsonSchema.properties],
      ...template.getChildrenInfo().getNonStaticIRIMap(),
    };

    let requiredChildren: string[] = [];
    if (this.behavior.includeOnlyElementsInPropertiesContextRequired()) {
      requiredChildren = template.getChildrenInfo().getOnlyElementNamesForPropertiesContextRequired();
    } else {
      requiredChildren = template.getChildrenInfo().getChildrenNamesForRequired();
    }

    properties[JsonSchema.atContext][JsonSchema.required] = [...properties[JsonSchema.atContext][JsonSchema.required], ...requiredChildren];

    // Attribute value modification
    if (template.getChildrenInfo().hasAttributeValue()) {
      properties[JsonSchema.atContext][TemplateProperty.additionalProperties] =
        JSONTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
    }

    // include the field/element definitions
    const extendedProperties = {
      ...properties,
      ...this.getChildMapAsJSON(template),
    };

    // Inject instance type specification, if present
    if (template.instanceTypeSpecification !== null) {
      const oneOfNode: Array<JsonNode> = extendedProperties[JsonSchema.atType][JsonSchema.oneOf];
      oneOfNode.forEach((item: JsonNode) => {
        const itemType = ReaderUtil.getString(item, JsonSchema.type);
        if (itemType == 'string') {
          item[JsonSchema.enum] = [template.instanceTypeSpecification];
        } else if (itemType == 'array') {
          const items: JsonNode = ReaderUtil.getNode(item, JsonSchema.items);
          items[JsonSchema.enum] = [template.instanceTypeSpecification];
        }
      });
    }

    return extendedProperties;
  }

  public getAsJsonString(template: Template, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(template), null, indent);
  }

  public getAsJsonNode(template: Template): JsonNode {
    const extendedProperties: JsonNode = this.buildProperties(template);

    const templateUI: JsonNode = {
      [CedarModel.order]: template.getChildrenInfo().getChildrenNames(),
      [CedarModel.propertyLabels]: template.getChildrenInfo().getPropertyLabelMap(),
      [CedarModel.propertyDescriptions]: template.getChildrenInfo().getPropertyDescriptionMap(),
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
      [JsonSchema.required]: [...JSONTemplateContent.REQUIRED_PARTIAL, ...template.getChildrenInfo().getChildrenNamesForRequired()],
      ...this.macroSchemaNameAndDescription(template),
      ...this.macroProvenance(template, this.atomicWriter),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(template.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(template.getAdditionalProperties()),
      ...this.macroStatusAndVersion(template, this.atomicWriter),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
      ...this.macroSchemaIdentifier(template),
      ...this.macroDerivedFrom(template),
      ...this.macroAnnotations(template),
    };
  }
}
