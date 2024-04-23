import YAML from 'yaml';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';

export class SimpleYamlSerializer {
  static serialize(obj: JsonNode): string {
    return YAML.stringify(obj, null, { blockQuote: 'literal', singleQuote: true });
  }
}
