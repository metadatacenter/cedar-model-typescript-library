import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { CedarTemplate } from '../../model/cedar/template/CedarTemplate';
import { ReaderUtil } from '../reader/ReaderUtil';
import { CedarJSONTemplateContent } from '../../model/cedar/util/serialization/CedarJSONTemplateContent';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { JsonNode, JsonNodeClass } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { CedarArtifactType } from '../../model/cedar/types/beans/CedarArtifactType';
import { JavascriptType } from '../../model/cedar/types/beans/JavascriptType';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { CedarSchema } from '../../model/cedar/types/beans/CedarSchema';
import { JSONAtomicWriter } from './JSONAtomicWriter';
import { CedarContainerChildInfo } from '../../model/cedar/types/beans/CedarContainerChildInfo';
import { CedarField } from '../../model/cedar/field/CedarField';
import { CedarWriters } from './CedarWriters';
import { JSONAbstractArtifactWriter } from './JSONAbstractArtifactWriter';
import { CedarJSONTemplateFieldContentDynamic } from '../../model/cedar/util/serialization/CedarJSONTemplateFieldContentDynamic';

export class JSONTemplateWriter extends JSONAbstractArtifactWriter {
  private behavior: JSONWriterBehavior;
  private writers: CedarWriters;
  private readonly atomicWriter: JSONAtomicWriter;

  private constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super();
    this.behavior = behavior;
    this.writers = writers;
    this.atomicWriter = writers.getJSONAtomicWriter();
  }

  public static getFor(behavior: JSONWriterBehavior, writers: CedarWriters): JSONTemplateWriter {
    return new JSONTemplateWriter(behavior, writers);
  }

  private buildProperties(template: CedarTemplate): JsonNode {
    // clone, because we will need to modify deep content
    const properties = ReaderUtil.deepClone(CedarJSONTemplateContent.PROPERTIES_PARTIAL);

    // Include the IRI mapping
    properties[JsonSchema.atContext][JsonSchema.properties] = {
      ...properties[JsonSchema.atContext][JsonSchema.properties],
      ...template.childrenInfo.getNonStaticIRIMap(),
    };

    properties[JsonSchema.atContext][JsonSchema.required] = [
      ...properties[JsonSchema.atContext][JsonSchema.required],
      ...template.childrenInfo.getChildrenNamesForRequired(),
    ];

    // Attribute value modification
    if (template.childrenInfo.hasAttributeValue()) {
      properties[JsonSchema.atContext][TemplateProperty.additionalProperties] =
        CedarJSONTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
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

  getAsJsonString(template: CedarTemplate, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(template), null, indent);
  }

  getAsJsonNode(template: CedarTemplate): JsonNode {
    const extendedProperties: JsonNode = this.buildProperties(template);

    const templateUI: JsonNode = {
      [CedarModel.order]: template.childrenInfo.getChildrenNames(),
      [CedarModel.propertyLabels]: template.childrenInfo.getPropertyLabelMap(),
      [CedarModel.propertyDescriptions]: template.childrenInfo.getPropertyDescriptionMap(),
    };
    if (template.header !== null) {
      templateUI[CedarModel.header] = template.header;
    }
    if (template.footer !== null) {
      templateUI[CedarModel.footer] = template.footer;
    }
    // if (JSONTemplateReader.getBehavior() == JSONTemplateReader.FEBRUARY_2024) {
    //   templateUI[CedarModel.pages] = [];
    // }

    const schemaIdentifier: JsonNode = JsonNodeClass.getEmpty();
    if (template.schema_identifier !== null) {
      schemaIdentifier[JsonSchema.schemaIdentifier] = template.schema_identifier;
    }

    // build the final object
    return {
      [JsonSchema.atId]: this.atomicWriter.write(template.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(CedarArtifactType.TEMPLATE),
      [JsonSchema.atContext]: CedarJSONTemplateContent.CONTEXT_VERBATIM,
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: template.title,
      [TemplateProperty.description]: template.description,
      [CedarModel.ui]: templateUI,
      [JsonSchema.properties]: extendedProperties,
      [JsonSchema.required]: [...CedarJSONTemplateContent.REQUIRED_PARTIAL, ...template.childrenInfo.getChildrenNamesForRequired()],
      ...this.macroSchemaNameAndDescription(template),
      ...this.macroProvenance(template, this.atomicWriter),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(template.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(template.getAdditionalProperties()),
      ...this.macroStatusAndVersion(template, this.atomicWriter),
      [CedarModel.schema]: this.atomicWriter.write(CedarSchema.CURRENT),
      ...schemaIdentifier,
    };
  }

  private getChildMapAsJSON(template: CedarTemplate): JsonNode {
    const childMap: JsonNode = JsonNodeClass.getEmpty();

    template.children.forEach((child) => {
      const childName = child.schema_name;
      if (childName !== null) {
        const childMeta: CedarContainerChildInfo | null = template.childrenInfo.get(childName);
        if (childMeta !== null) {
          if (childMeta.multiInstance) {
            // TODO: handle maxItems, minItems inconsistencies
            const childNode: JsonNode = {
              [JsonSchema.type]: 'array',
              [CedarModel.minItems]: childMeta.minItems,
            };
            if (child instanceof CedarField) {
              childNode[JsonSchema.items] = this.writers.getJSONFieldWriter(child.cedarFieldType).getAsJsonNode(child);
            }
            if (childMeta.maxItems !== null) {
              childNode[CedarModel.maxItems] = childMeta.maxItems;
            }
            childMap[childName] = childNode;
          } else {
            if (child instanceof CedarField) {
              childMap[childName] = this.writers.getJSONFieldWriter(child.cedarFieldType).getAsJsonNode(child);
            }
          }
        }
      }
    });

    return childMap;
  }
}
