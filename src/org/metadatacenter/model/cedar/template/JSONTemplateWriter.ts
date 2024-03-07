import { JSONWriterBehavior } from '../../../behavior/JSONWriterBehavior';
import { CedarTemplate } from './CedarTemplate';
import { ReaderUtil } from '../../../io/reader/ReaderUtil';
import { CedarTemplateContent } from '../util/serialization/CedarTemplateContent';
import { JsonSchema } from '../constants/JsonSchema';
import { JsonNode, JsonNodeClass } from '../util/types/JsonNode';
import { CedarModel } from '../CedarModel';
import { CedarArtifactType } from '../beans/CedarArtifactType';
import { JavascriptType } from '../beans/JavascriptType';
import { TemplateProperty } from '../constants/TemplateProperty';
import { CedarSchema } from '../beans/CedarSchema';
import { JSONAtomicWriter } from '../../../io/writer/JSONAtomicWriter';
import { CedarContainerChildInfo } from '../beans/CedarContainerChildInfo';
import { CedarField } from '../field/CedarField';
import { CedarWriters } from '../../../io/writer/CedarWriters';
import { JSONAbstractArtifactWriter } from '../JSONAbstractArtifactWriter';

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

  getAsJsonString(template: CedarTemplate, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(template), null, indent);
  }

  getAsJsonNode(template: CedarTemplate): JsonNode {
    // clone, because we will need to modify deep content
    const properties = ReaderUtil.deepClone(CedarTemplateContent.PROPERTIES_PARTIAL);

    // Include the IRI mapping
    properties[JsonSchema.atContext][JsonSchema.properties] = {
      ...properties[JsonSchema.atContext][JsonSchema.properties],
      ...template.childrenInfo.getNonStaticIRIMap(),
    };

    properties[JsonSchema.atContext][JsonSchema.required] = [
      ...properties[JsonSchema.atContext][JsonSchema.required],
      ...template.childrenInfo.getNonStaticChildrenNames(),
    ];

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
      [JsonSchema.atContext]: CedarTemplateContent.CONTEXT_VERBATIM,
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: template.title,
      [TemplateProperty.description]: template.description,
      [CedarModel.ui]: templateUI,
      [JsonSchema.properties]: extendedProperties,
      [JsonSchema.required]: [...CedarTemplateContent.REQUIRED_PARTIAL, ...template.childrenInfo.getNonStaticChildrenNames()],
      ...this.macroSchemaNameAndDescription(template),
      ...this.macroProvenance(template, this.atomicWriter),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(template.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: false,
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
