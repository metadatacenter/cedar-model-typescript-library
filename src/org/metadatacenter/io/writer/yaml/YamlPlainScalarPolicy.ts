import { YamlValues } from '../../../model/cedar/constants/YamlValues';
import { BioportalTermTypeYamlValues } from '../../../model/cedar/types/bioportal-types/BioportalTermType';
import { BiboStatusYamlValues } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { NumberTypeValues } from '../../../model/cedar/types/wrapped-types/NumberType';
import { TemporalGranularityValues } from '../../../model/cedar/types/wrapped-types/TemporalGranularity';
import { TemporalTypeValues } from '../../../model/cedar/types/wrapped-types/TemporalType';
import { TimeFormatValues } from '../../../model/cedar/types/wrapped-types/TimeFormat';
import { YamlArtifactTypeValues } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';

// Spellings resolved as numbers, booleans, or null by a YAML 1.1 or 1.2 reader. The Java library's
// YamlScalarQuotingChecker applies the same cross-version boundary.
const someReaderWouldClaim = [
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

function plainCannotCarry(text: string): boolean {
  for (const character of text) {
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
  return text.startsWith(' ') || text.endsWith(' ') || text.includes(' \n') || text.length === 0;
}

export function plainScalarNeedsQuoting(text: string): boolean {
  return someReaderWouldClaim.some((pattern) => pattern.test(text)) || plainCannotCarry(text);
}

const typeValues = new Set<string>([
  ...Object.values(YamlArtifactTypeValues),
  'element-instance',
  YamlValues.Controlled.class,
  BioportalTermTypeYamlValues.VALUE,
  YamlValues.Controlled.ontology,
  YamlValues.Controlled.branch,
  YamlValues.Controlled.valueSet,
]);

const datatypeValues = new Set<string>([
  'xsd:string',
  'xsd:anyUri',
  ...Object.values(TemporalTypeValues),
  ...Object.values(NumberTypeValues),
  YamlValues.iri,
]);

const versionPattern = /^\d+\.\d+\.\d+$/;

// These are the only string-valued YAML positions owned completely by CEDAR. Every other string is
// left double-quoted, even when its current spelling happens to be safe as a plain scalar.
const closedVocabularies: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ['type', typeValues],
  ['status', new Set(Object.values(BiboStatusYamlValues))],
  ['datatype', datatypeValues],
  ['action', new Set(['move', 'delete'])],
  ['granularity', new Set(Object.values(TemporalGranularityValues))],
  ['termType', new Set(Object.values(BioportalTermTypeYamlValues))],
  ['inputTimeFormat', new Set(Object.values(TimeFormatValues))],
]);

export const yamlPlainScalarFields: ReadonlySet<string> = new Set([...closedVocabularies.keys(), 'version', 'modelVersion']);

export function mayWriteYamlValuePlain(field: string, value: string): boolean {
  const inVocabulary =
    closedVocabularies.get(field)?.has(value) ?? ((field === 'version' || field === 'modelVersion') && versionPattern.test(value));
  return inVocabulary && !plainScalarNeedsQuoting(value);
}
