import YAML, { isPair, isScalar, Scalar, ToStringOptions, visit } from 'yaml';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { mayWriteYamlValuePlain, plainScalarNeedsQuoting } from './YamlPlainScalarPolicy';

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
    const document = new YAML.Document(obj);
    visit(document, {
      Scalar(key, node, path) {
        if (key === 'key' && typeof node.value === 'string' && plainScalarNeedsQuoting(node.value)) {
          node.type = Scalar.QUOTE_DOUBLE;
        } else if (key === 'value' && typeof node.value === 'string') {
          const pair = path.at(-1);
          if (
            isPair(pair) &&
            isScalar(pair.key) &&
            typeof pair.key.value === 'string' &&
            mayWriteYamlValuePlain(pair.key.value, node.value)
          ) {
            node.type = Scalar.PLAIN;
          }
        }
      },
    });
    return document.toString(options).trim() + '\n';
  }
}
