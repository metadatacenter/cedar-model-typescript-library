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

// Match the Java library's SnakeYAML double-quoted spelling. JSON-style quoting alone leaves
// C1 controls literal; Java rejects those, and folds a literal NEL into a different character.
const shortEscapes = new Map<number, string>([
  [0, '0'],
  [7, 'a'],
  [8, 'b'],
  [9, 't'],
  [10, 'n'],
  [11, 'v'],
  [12, 'f'],
  [13, 'r'],
  [27, 'e'],
  [34, '"'],
  [92, '\\'],
  [0x85, 'N'],
  [0xa0, '_'],
  [0x2028, 'L'],
  [0x2029, 'P'],
]);

function quoteLikeJava(value: string): string {
  let result = '"';
  for (const character of value) {
    const code = character.codePointAt(0)!;
    const short = shortEscapes.get(code);
    if (short !== undefined) result += '\\' + short;
    else if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) result += '\\x' + code.toString(16).padStart(2, '0');
    else if ((code >= 0xd800 && code <= 0xdfff) || code === 0xfffe || code === 0xffff) result += '\\u' + code.toString(16).padStart(4, '0');
    else result += character;
  }
  return result + '"';
}

export class SimpleYamlSerializer {
  static serialize(obj: JsonNode): string {
    const document = new YAML.Document(obj, {
      customTags: (tags) =>
        tags.map((tag) =>
          typeof tag !== 'string' && tag.collection === undefined && tag.tag === 'tag:yaml.org,2002:str'
            ? {
                ...tag,
                stringify(item, context, onComment, onChompKeep) {
                  const rendered = tag.stringify!(item, context, onComment, onChompKeep);
                  return rendered.startsWith('"') ? quoteLikeJava(String(item.value)) : rendered;
                },
              }
            : tag,
        ),
    });
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
