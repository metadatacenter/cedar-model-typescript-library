import YAML, { Scalar, ToStringOptions, visit } from 'yaml';
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

// A value is quoted whatever it says, so nothing a reader resolves can reach it. A key is written
// plain, and there the same hazards apply: a name that some reader takes for a number, a boolean or
// null, or one carrying whitespace a reader strips or a character a plain scalar cannot hold. These
// are the rules the Java library's quoting checker applies to a name, so a key is quoted here exactly
// where it is quoted there, and ordinary names stay plain in both.
const nameSomeReaderWouldClaim = [
  /^(y|Y|n|N|yes|Yes|YES|no|No|NO|on|On|ON|off|Off|OFF|true|True|TRUE|false|False|FALSE)$/,
  /^(null|Null|NULL|~|<<|=)$/,
  /^[-+]?[0-9][0-9_]*$/,
  /^[-+]?0[xX][0-9a-fA-F_]+$/,
  /^[-+]?0[bB][01_]+$/,
  /^[-+]?0[oO]?[0-7_]+$/,
  /^[-+]?[0-9_]*\.?[0-9_]+([eE][-+]?[0-9]+)?$/,
  /^[-+]?\.(inf|Inf|INF|nan|NaN|NAN)$/,
  /^[-+]?[0-9][0-9_]*(:[0-5]?[0-9])+(\.[0-9_]*)?$/,
];

// Whitespace a reader strips from a plain scalar, and the characters a plain scalar cannot carry back
// intact: a tab or carriage return, a C0 or C1 control, DEL, a no-break or otherwise exotic Unicode
// space, a line or paragraph separator, a byte-order mark.
function plainCannotCarry(name: string): boolean {
  for (const character of name) {
    const codePoint = character.codePointAt(0) ?? 0;
    const control =
      codePoint === 0x09 || codePoint === 0x0d || (codePoint <= 0x1f && codePoint !== 0x0a) || (codePoint >= 0x7f && codePoint <= 0xa0);
    const exoticSpace =
      codePoint === 0x1680 ||
      (codePoint >= 0x2000 && codePoint <= 0x200a) ||
      codePoint === 0x2028 ||
      codePoint === 0x2029 ||
      codePoint === 0x202f ||
      codePoint === 0x205f ||
      codePoint === 0x3000 ||
      codePoint === 0xfeff;
    if (control || exoticSpace) {
      return true;
    }
  }
  return name.startsWith(' ') || name.endsWith(' ') || name.includes(' \n') || name.length === 0;
}

function keyNeedsQuoting(name: string): boolean {
  return nameSomeReaderWouldClaim.some((pattern) => pattern.test(name)) || plainCannotCarry(name);
}

export class SimpleYamlSerializer {
  static serialize(obj: JsonNode): string {
    const document = new YAML.Document(obj);
    visit(document, {
      Scalar(key, node) {
        if (key === 'key' && typeof node.value === 'string' && keyNeedsQuoting(node.value)) {
          node.type = Scalar.QUOTE_DOUBLE;
        }
      },
    });
    return document.toString(options).trim() + '\n';
  }
}
