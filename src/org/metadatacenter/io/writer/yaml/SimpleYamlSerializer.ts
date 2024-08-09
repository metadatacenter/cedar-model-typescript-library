import YAML, { Scalar, ToStringOptions } from 'yaml';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';

// Function to escape newline characters in strings
const escapeNewlines = (value: any): any => {
  if (typeof value === 'string') {
    return value.replace(/\n/g, '\u005Cn');
  } else if (Array.isArray(value)) {
    return value.map(escapeNewlines);
  } else if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, escapeNewlines(val)]));
  }
  return value;
};

const customReplacer = (key: any, value: any) => {
  // TODO: put this back, if number should be rendered as number
  // if (typeof value === 'string' && /^\d+$/.test(value)) {
  //   return new Scalar(parseInt(value));
  // }
  // return value;
  return escapeNewlines(value);
};

const options = {
  blockQuote: 'literal',
  // singleQuote: false,
  lineWidth: 0, //remove this, or set to 80
  defaultStringType: 'QUOTE_DOUBLE', //remove or change to PLAIN
  defaultKeyType: 'PLAIN', //remove or keep PLAIN
} as ToStringOptions;

export class SimpleYamlSerializer {
  static serialize(obj: JsonNode): string {
    return YAML.stringify(obj, customReplacer, options).trim() + '\n';
  }
}
