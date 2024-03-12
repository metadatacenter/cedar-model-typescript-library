import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { CedarTemplate } from '../../model/cedar/template/CedarTemplate';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactType } from '../../model/cedar/types/beans/CedarArtifactType';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { CedarWriters } from './CedarWriters';
import { SimpleYamlSerializer } from '../util/yaml/SimpleYamlSerializer';
import { YAMLAbstractArtifactWriter } from './YAMLAbstractArtifactWriter';

export class YAMLTemplateWriter extends YAMLAbstractArtifactWriter {
  private constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
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