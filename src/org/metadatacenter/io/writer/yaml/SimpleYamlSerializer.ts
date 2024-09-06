import YAML, { ToStringOptions } from 'yaml';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';

const options = {
  blockQuote: 'literal',
  doubleQuotedMinMultiLineLength: 1000000000,
  lineWidth: 0,
  minContentWidth: 0,
  defaultStringType: 'QUOTE_DOUBLE',
  defaultKeyType: 'PLAIN',
  doubleQuotedAsJSON: true,
} as ToStringOptions;

export class SimpleYamlSerializer {
  static serialize(obj: JsonNode): string {
    return YAML.stringify(obj, options).trim() + '\n';
  }
}
