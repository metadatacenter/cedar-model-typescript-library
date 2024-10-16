import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from './CedarYamlWriters';
import { YamlAbstractArtifactWriter } from './YamlAbstractArtifactWriter';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';

export class YamlTemplateInstanceWriter extends YamlAbstractArtifactWriter {
  private constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: YamlWriterBehavior, writers: CedarYamlWriters): YamlTemplateInstanceWriter {
    return new YamlTemplateInstanceWriter(behavior, writers);
  }

  public getYamlAsJsonNode(instance: TemplateInstance): JsonNode {
    // build the final object
    const template: JsonNode = {
      ...this.macroType(instance),
      ...this.macroNameAndDescription(instance),
      ...this.macroId(instance),
      ...this.macroIsBasedOn(instance),
      ...this.macroDerivedFrom(instance),
      ...this.macroProvenance(instance),
    };
    return template;
  }

  public getAsYamlString(instance: TemplateInstance): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(instance));
  }
}
