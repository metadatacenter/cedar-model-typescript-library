import { JavascriptType } from '../beans/JavascriptType';
import { BiboStatus } from '../beans/BiboStatus';
import { SchemaVersion } from '../beans/SchemaVersion';
import { JsonSchema } from '../constants/JsonSchema';
import { TemplateProperty } from '../constants/TemplateProperty';
import { CedarArtifactType } from '../beans/CedarArtifactType';
import { CedarModel } from '../CedarModel';
import { CedarSchema } from '../beans/CedarSchema';
import { PavVersion } from '../beans/PavVersion';
import { CedarArtifactId } from '../beans/CedarArtifactId';
import { CedarTemplateContent } from '../util/serialization/CedarTemplateContent';
import { CedarContainerChildrenInfo } from '../beans/CedarContainerChildrenInfo';
import { ReaderUtil } from '../../../reader/ReaderUtil';
import { CedarTemplateChild } from '../util/types/CedarTemplateChild';
import { CedarAbstractArtifact } from '../CedarAbstractArtifact';
import { JsonNode, JsonNodeClass } from '../util/types/JsonNode';
import { CedarContainerChildInfo } from '../beans/CedarContainerChildInfo';

export class CedarTemplate extends CedarAbstractArtifact {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  public title: string | null = null;
  public description: string | null = null;
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  public header: string | null = null;
  public footer: string | null = null;
  public schema_identifier: string | null = null;
  public instanceTypeSpecification: string | null = null;
  // Children
  public childrenInfo: CedarContainerChildrenInfo = new CedarContainerChildrenInfo();
  public children: Array<CedarTemplateChild> = [];

  private constructor() {
    super();
  }

  public static buildEmptyWithNullValues(): CedarTemplate {
    return new CedarTemplate();
  }

  public static buildEmptyWithDefaultValues(): CedarTemplate {
    const r = new CedarTemplate();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    r.bibo_status = BiboStatus.DRAFT;
    r.pav_version = PavVersion.DEFAULT;
    return r;
  }

  /**
   * Do not use directly, it will not produce the expected result
   * Use asCedarTemplateString(indent) or asCedarTemplateObject() instead
   * Will be used by JSON.stringify
   */
  private toJSON() {
    // clone, because we will need to modify deep content
    const properties = ReaderUtil.deepClone(CedarTemplateContent.PROPERTIES_PARTIAL);

    // Include the IRI mapping
    properties[JsonSchema.atContext][JsonSchema.properties] = {
      ...properties[JsonSchema.atContext][JsonSchema.properties],
      ...this.childrenInfo.getNonStaticIRIMap(),
    };

    properties[JsonSchema.atContext][JsonSchema.required] = [
      ...properties[JsonSchema.atContext][JsonSchema.required],
      ...this.childrenInfo.getNonStaticChildrenNames(),
    ];

    // include the field/element definitions
    const extendedProperties = {
      ...properties,
      ...this.getChildMap(),
    };

    // Inject instance type specification, if present
    if (this.instanceTypeSpecification !== null) {
      const oneOfNode: Array<JsonNode> = extendedProperties[JsonSchema.atType][JsonSchema.oneOf];
      oneOfNode.forEach((item: JsonNode) => {
        const itemType = ReaderUtil.getString(item, JsonSchema.type);
        if (itemType == 'string') {
          item[JsonSchema.enum] = [this.instanceTypeSpecification];
        } else if (itemType == 'array') {
          const items: JsonNode = ReaderUtil.getNode(item, JsonSchema.items);
          items[JsonSchema.enum] = [this.instanceTypeSpecification];
        }
      });
    }

    const templateUI: JsonNode = {
      [CedarModel.order]: this.childrenInfo.getChildrenNames(),
      [CedarModel.propertyLabels]: this.childrenInfo.getPropertyLabelMap(),
      [CedarModel.propertyDescriptions]: this.childrenInfo.getPropertyDescriptionMap(),
    };
    if (this.header !== null) {
      templateUI[CedarModel.header] = this.header;
    }
    if (this.footer !== null) {
      templateUI[CedarModel.footer] = this.footer;
    }

    const schemaIdentifier: JsonNode = {};
    if (this.schema_identifier !== null) {
      schemaIdentifier[JsonSchema.schemaIdentifier] = this.schema_identifier;
    }

    // build the final object
    return {
      [JsonSchema.atId]: this.at_id,
      [JsonSchema.atType]: CedarArtifactType.TEMPLATE,
      [JsonSchema.atContext]: CedarTemplateContent.CONTEXT_VERBATIM,
      [CedarModel.type]: JavascriptType.OBJECT,
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      [CedarModel.ui]: templateUI,
      [JsonSchema.properties]: extendedProperties,
      [JsonSchema.required]: [...CedarTemplateContent.REQUIRED_PARTIAL, ...this.childrenInfo.getNonStaticChildrenNames()],
      ...this.macroSchemaNameAndDescription(),
      ...this.macroProvenance(),
      [JsonSchema.schemaVersion]: this.schema_schemaVersion,
      [TemplateProperty.additionalProperties]: false,
      ...this.macroStatusAndVersion(),
      [CedarModel.schema]: CedarSchema.CURRENT,
      ...schemaIdentifier,
    };
  }

  public asCedarTemplateJSONObject(): object {
    return JSON.parse(JSON.stringify(this));
  }

  public asCedarNode(): JsonNode {
    return this.asCedarTemplateJSONObject() as JsonNode;
  }

  public asCedarTemplateJSONString(indent: number = 2): string {
    return JSON.stringify(this, null, indent);
  }

  // public asCedarTemplateYamlObject(): object {
  //   // build the final object
  //   return {
  //     id: this.at_id.toJSON(),
  //     type: CedarArtifactType.TEMPLATE.toJSON(),
  //     [TemplateProperty.title]: this.title,
  //     [TemplateProperty.description]: this.description,
  //     [JsonSchema.schemaName]: this.schema_name,
  //     [JsonSchema.schemaDescription]: this.schema_description,
  //     [JsonSchema.pavCreatedOn]: this.pav_createdOn?.toJSON(),
  //     [JsonSchema.pavCreatedBy]: this.pav_createdBy.toJSON(),
  //     [JsonSchema.pavLastUpdatedOn]: this.pav_lastUpdatedOn?.toJSON(),
  //     [JsonSchema.oslcModifiedBy]: this.oslc_modifiedBy.toJSON(),
  //     [JsonSchema.schemaVersion]: this.schema_schemaVersion.toJSON(),
  //     [JsonSchema.pavVersion]: this.pav_version.toJSON(),
  //     [JsonSchema.biboStatus]: this.bibo_status.toJSON(),
  //     [CedarModel.propertyLabels]: this.childrenInfo.getPropertyLabelMap(),
  //     [CedarModel.propertyDescriptions]: this.childrenInfo.getPropertyDescriptionMap(),
  //     children: this.childrenInfo.getChildrenDefinitions(),
  //   };
  // }

  addChild(templateChild: CedarTemplateChild): void {
    this.children.push(templateChild);
  }

  private getChildMap(): JsonNode {
    const childMap: JsonNode = JsonNodeClass.EMPTY;

    this.children.forEach((child) => {
      const childName = child.schema_name;
      if (childName !== null) {
        const childMeta: CedarContainerChildInfo | null = this.childrenInfo.get(childName);
        if (childMeta !== null) {
          if (childMeta.multiInstance) {
            // TODO: handle maxItems, minItems inconsistencies
            const childNode: JsonNode = {
              [JsonSchema.type]: 'array',
              [CedarModel.minItems]: childMeta.minItems,
              [JsonSchema.items]: child,
            };
            if (childMeta.maxItems !== null) {
              childNode[CedarModel.maxItems] = childMeta.maxItems;
            }
            childMap[childName] = childNode;
          } else {
            childMap[childName] = child;
          }
        }
      }
    });

    return childMap;
  }
}
