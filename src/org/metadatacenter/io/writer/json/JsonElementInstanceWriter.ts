import { stringifyInstance } from './stringifyInstance';
import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { IsoDate } from '../../../model/cedar/types/wrapped-types/IsoDate';
import { ElementInstance } from '../../../model/cedar/template-instance/ElementInstance';
import { CedarJsonWriters } from './CedarJsonWriters';
import { JsonAbstractArtifactWriter } from './JsonAbstractArtifactWriter';

/**
 * Write an element instance that stands on its own, as Java's `JsonArtifactRenderer.renderElementInstanceArtifact`
 * writes one: the object a template instance holds for a nested element, with the name and description
 * after its classes, and after its `@context` whichever of the four provenance keys it has a value for.
 */
export class JsonElementInstanceWriter extends JsonAbstractArtifactWriter {
  private constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: JsonWriterBehavior, writers: CedarJsonWriters): JsonElementInstanceWriter {
    return new JsonElementInstanceWriter(behavior, writers);
  }

  public getAsJsonNode(instance: ElementInstance): JsonNode {
    const data = this.writers.getTemplateInstanceWriter().getElementInstanceDataNode(instance.dataContainer);
    const node: JsonNode = JsonNode.getEmpty();
    node[JsonSchema.atId] = instance.at_id !== CedarArtifactId.NULL ? this.atomicWriter.write(instance.at_id) : data[JsonSchema.atId];
    if (Object.hasOwn(data, JsonSchema.atType)) {
      node[JsonSchema.atType] = data[JsonSchema.atType];
    }
    if (instance.schema_name !== null) {
      node[JsonSchema.schemaName] = instance.schema_name;
    }
    if (!instance.descriptionWasAbsent || instance.schema_description !== '') {
      node[JsonSchema.schemaDescription] = instance.schema_description;
    }
    for (const key of Object.keys(data)) {
      if (key !== JsonSchema.atId && key !== JsonSchema.atType && key !== JsonSchema.atContext) {
        node[key] = data[key];
      }
    }
    node[JsonSchema.atContext] = data[JsonSchema.atContext];
    if (instance.pav_createdOn !== IsoDate.NULL) {
      node[JsonSchema.pavCreatedOn] = this.atomicWriter.write(instance.pav_createdOn);
    }
    if (instance.pav_createdBy !== CedarUser.NULL) {
      node[JsonSchema.pavCreatedBy] = this.atomicWriter.write(instance.pav_createdBy);
    }
    if (instance.pav_lastUpdatedOn !== IsoDate.NULL) {
      node[JsonSchema.pavLastUpdatedOn] = this.atomicWriter.write(instance.pav_lastUpdatedOn);
    }
    if (instance.oslc_modifiedBy !== CedarUser.NULL) {
      node[JsonSchema.oslcModifiedBy] = this.atomicWriter.write(instance.oslc_modifiedBy);
    }
    return node;
  }

  public getAsJsonString(instance: ElementInstance, indent: number = 2): string {
    return stringifyInstance(this.getAsJsonNode(instance), instance.dataContainer, indent);
  }
}
