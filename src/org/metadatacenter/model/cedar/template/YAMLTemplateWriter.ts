import { JSONWriterBehavior } from '../../../behavior/JSONWriterBehavior';
import { CedarTemplate } from './CedarTemplate';
import { JsonSchema } from '../constants/JsonSchema';
import { JsonNode } from '../util/types/JsonNode';
import { CedarArtifactType } from '../beans/CedarArtifactType';
import { TemplateProperty } from '../constants/TemplateProperty';
import { JSONAtomicWriter } from '../../../io/writer/JSONAtomicWriter';
import { CedarWriters } from '../../../io/writer/CedarWriters';
import { SimpleYamlSerializer } from '../util/yaml/SimpleYamlSerializer';
import { YAMLAbstractArtifactWriter } from '../YAMLAbstractArtifactWriter';

export class YAMLTemplateWriter extends YAMLAbstractArtifactWriter {
  private behavior: JSONWriterBehavior;
  private writers: CedarWriters;
  private readonly atomicWriter: JSONAtomicWriter;

  private constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super();
    this.behavior = behavior;
    this.writers = writers;
    this.atomicWriter = writers.getJSONAtomicWriter();
  }

  public static getFor(behavior: JSONWriterBehavior, writers: CedarWriters): YAMLTemplateWriter {
    return new YAMLTemplateWriter(behavior, writers);
  }

  getAsYamlNode(template: CedarTemplate): JsonNode {
    // build the final object
    return {
      [JsonSchema.atId]: this.atomicWriter.write(template.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(CedarArtifactType.TEMPLATE),
      [TemplateProperty.title]: template.title,
      [TemplateProperty.description]: template.description,
      ...this.macroSchemaNameAndDescription(template),
      ...this.macroProvenance(template, this.atomicWriter),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(template.schema_schemaVersion),
      ...this.macroStatusAndVersion(template, this.atomicWriter),
    };
  }

  getAsYamlString(template: CedarTemplate): string {
    return SimpleYamlSerializer.serialize(this.getAsYamlNode(template));
  }
}
