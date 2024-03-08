import { JSONWriterBehavior } from '../../../behavior/JSONWriterBehavior';
import { JSONAtomicWriter } from '../../../io/writer/JSONAtomicWriter';
import { JsonNode, JsonNodeClass } from '../util/types/JsonNode';
import { CedarField } from './CedarField';
import { CedarModel } from '../CedarModel';
import { JsonSchema } from '../constants/JsonSchema';
import { CedarTemplateFieldContent } from '../util/serialization/CedarTemplateFieldContent';
import { JavascriptType } from '../beans/JavascriptType';
import { TemplateProperty } from '../constants/TemplateProperty';
import { CedarSchema } from '../beans/CedarSchema';
import { CedarWriters } from '../../../io/writer/CedarWriters';
import { JSONAbstractArtifactWriter } from '../JSONAbstractArtifactWriter';

export class JSONFieldWriter extends JSONAbstractArtifactWriter {
  private behavior: JSONWriterBehavior;
  private writers: CedarWriters;
  protected atomicWriter: JSONAtomicWriter;

  protected constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super();
    this.behavior = behavior;
    this.writers = writers;
    this.atomicWriter = writers.getJSONAtomicWriter();
  }

  public static getFor(behavior: JSONWriterBehavior, writers: CedarWriters): JSONFieldWriter {
    return new JSONFieldWriter(behavior, writers);
  }

  protected expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = CedarTemplateFieldContent.PROPERTIES_VERBATIM_LITERAL;
  }

  protected expandRequiredNodeForJSON(requiredObject: JsonNode): void {
    requiredObject[JsonSchema.required] = [JsonSchema.atValue];
  }

  protected expandUINodeForJSON(uiNode: JsonNode, field: CedarField): void {}

  protected expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarField): void {
    vcNode[CedarModel.requiredValue] = field.valueConstraints.requiredValue;
  }

  public getAsJsonNode(field: CedarField): JsonNode {
    // Build properties wrapper, based on type
    const propertiesObject: JsonNode = JsonNodeClass.getEmpty();
    this.expandPropertiesNodeForJSON(propertiesObject);

    // Build required wrapper
    const requiredObject: JsonNode = JsonNodeClass.getEmpty();
    this.expandRequiredNodeForJSON(requiredObject);

    // Build ui wrapper
    const uiNode: JsonNode = {
      [CedarModel.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
    };
    const uiObject: JsonNode = {
      [CedarModel.ui]: uiNode,
    };
    this.expandUINodeForJSON(uiNode, field);

    // Build value constraints wrapper
    const vcNode: JsonNode = JsonNodeClass.getEmpty();
    const vcObject: JsonNode = {
      [CedarModel.valueConstraints]: vcNode,
    };
    this.expandValueConstraintsNodeForJSON(vcNode, field);

    // build the final object
    return {
      [JsonSchema.atId]: this.atomicWriter.write(field.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(field.cedarArtifactType),
      [JsonSchema.atContext]: CedarTemplateFieldContent.CONTEXT_VERBATIM,
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: field.title,
      [TemplateProperty.description]: field.description,
      ...uiObject,
      ...vcObject,
      ...propertiesObject,
      ...requiredObject,
      ...this.macroSchemaNameAndDescription(field),
      ...this.macroProvenance(field, this.atomicWriter),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(field.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: false,
      ...this.macroStatusAndVersion(field, this.atomicWriter),
      [CedarModel.schema]: this.atomicWriter.write(CedarSchema.CURRENT),
      ...this.macroSkos(field),
    };
  }
}
