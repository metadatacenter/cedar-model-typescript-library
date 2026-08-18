export interface DiagnosticExpectation {
  errors: number;
  warnings: number;
  reason: string;
}

export interface RoundTripExpectation extends DiagnosticExpectation {
  roundTripErrors: number;
  roundTripWarnings: number;
}

export const CLEAN_DIAGNOSTICS = { errors: 0, warnings: 0 } as const;

export const diagnosticsFor = (
  expectations: Readonly<Record<string, DiagnosticExpectation>>,
  key: string | number,
): { errors: number; warnings: number } => {
  const expectation = expectations[String(key)];
  return expectation === undefined ? CLEAN_DIAGNOSTICS : { errors: expectation.errors, warnings: expectation.warnings };
};

export const CEE_TEMPLATE_DIAGNOSTICS: Readonly<Record<string, DiagnosticExpectation>> = {
  '008': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '009': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '011': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '012': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '013': { errors: 0, warnings: 2, reason: 'known production blueprint variations' },
  '016': { errors: 0, warnings: 2, reason: 'known production blueprint variations' },
  '020': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '041': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '043': { errors: 0, warnings: 71, reason: 'legacy context and UI metadata variations' },
  '045': { errors: 0, warnings: 15, reason: 'legacy context and UI metadata variations' },
  '046': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '047': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '060': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '063': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '071': { errors: 0, warnings: 6, reason: 'legacy context and UI metadata variations' },
  '072': { errors: 0, warnings: 5, reason: 'legacy context and UI metadata variations' },
  '073': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '075': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  '076': { errors: 0, warnings: 7, reason: 'legacy context and UI metadata variations' },
  '085': { errors: 0, warnings: 4, reason: 'legacy context and UI metadata variations' },
  '086': { errors: 14, warnings: 20, reason: 'the committed source is deliberately malformed JSON' },
  '087': { errors: 0, warnings: 7, reason: 'legacy context and UI metadata variations' },
};

const CEE_INSTANCE_SIX_WARNING_CASES = [
  '004',
  '008',
  '009',
  '011',
  '012',
  '013',
  '015',
  '017',
  '018',
  '019',
  '020',
  '021',
  '024',
  '025',
  '026',
  '030',
  '032',
  '034',
  '035',
  '036',
  '042',
  '044',
  '046',
  '057',
  '060',
  '063',
  '066',
];

export const CEE_INSTANCE_DIAGNOSTICS: Readonly<Record<string, DiagnosticExpectation>> = {
  ...Object.fromEntries(
    CEE_INSTANCE_SIX_WARNING_CASES.map((id) => [id, { errors: 0, warnings: 6, reason: 'legacy instance envelope variations' }]),
  ),
  '029': { errors: 0, warnings: 5, reason: 'legacy instance envelope variations' },
  '041': { errors: 0, warnings: 7, reason: 'legacy instance envelope variations' },
  '071': { errors: 0, warnings: 5, reason: 'legacy instance envelope variations' },
  '085': { errors: 0, warnings: 5, reason: 'legacy instance envelope variations' },
  '086': { errors: 0, warnings: 5, reason: 'legacy instance envelope variations' },
};

export const EXTERNAL_TEMPLATE_DIAGNOSTICS: Readonly<Record<string, DiagnosticExpectation>> = {
  'ADVANCETemplate.json': { errors: 0, warnings: 3, reason: 'known production blueprint variations' },
  'NullPropertyLabelsTemplate.json': { errors: 1, warnings: 12, reason: 'null property-label metadata' },
  'RADx2.0CLIGeneratedTemplate.json': { errors: 10, warnings: 5, reason: 'legacy CLI-generated schema shape' },
  'RADxCLIGeneratedTemplate.json': { errors: 10, warnings: 4, reason: 'legacy CLI-generated schema shape' },
  'SampleFieldWithActions.json': { errors: 11, warnings: 12, reason: 'actions-era field schema shape' },
  'SimpleTemplateWithAttributeValues.json': {
    errors: 0,
    warnings: 1,
    reason: 'legacy attribute-value context variation',
  },
  'SimpleTemplateWithType.json': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  'TemplateWithOverrideLabels.json': { errors: 0, warnings: 7, reason: 'legacy label metadata variations' },
  'template-022.json': { errors: 0, warnings: 1, reason: 'known production blueprint variation' },
  'template-029.json': { errors: 28, warnings: 6, reason: 'legacy deeply nested schema shape' },
  'template-037.json': { errors: 0, warnings: 7, reason: 'legacy static-field metadata variations' },
};

export const JSON_TEMPLATE_ROUND_TRIP_DIVERGENCES: Readonly<Record<string, RoundTripExpectation>> = {
  '3': {
    errors: 7,
    warnings: 0,
    roundTripErrors: 19,
    roundTripWarnings: 0,
    reason: 'legacy required/context/UI metadata differs from the canonical writer',
  },
  '4': {
    errors: 0,
    warnings: 0,
    roundTripErrors: 2,
    roundTripWarnings: 0,
    reason: 'writer supplies missing _content on two static page breaks',
  },
  '9': {
    errors: 0,
    warnings: 0,
    roundTripErrors: 2,
    roundTripWarnings: 0,
    reason: 'writer supplies missing _content on two static breaks',
  },
  '22': {
    errors: 0,
    warnings: 0,
    roundTripErrors: 1,
    roundTripWarnings: 0,
    reason: 'legacy attribute-value context mapping is absent',
  },
  '29': {
    errors: 0,
    warnings: 0,
    roundTripErrors: 1978,
    roundTripWarnings: 0,
    reason: 'large legacy template is intentionally canonicalized throughout',
  },
  '35': {
    errors: 0,
    warnings: 0,
    roundTripErrors: 87,
    roundTripWarnings: 0,
    reason: 'legacy UI descriptions and pages are canonicalized',
  },
  '37': {
    errors: 0,
    warnings: 0,
    roundTripErrors: 1,
    roundTripWarnings: 0,
    reason: 'writer supplies missing _content on a static field',
  },
};

export const JSON_FIELD_ROUND_TRIP_DIVERGENCES: Readonly<Record<string, RoundTripExpectation>> = {
  '8': {
    errors: 0,
    warnings: 0,
    roundTripErrors: 1,
    roundTripWarnings: 0,
    reason: 'legacy defaultValue presence is canonicalized',
  },
  '13': {
    errors: 0,
    warnings: 0,
    roundTripErrors: 5,
    roundTripWarnings: 0,
    reason: 'legacy @type schema and language metadata are canonicalized',
  },
};

export const JSON_ELEMENT_ROUND_TRIP_DIVERGENCES: Readonly<Record<string, RoundTripExpectation>> = {
  '1': {
    errors: 1,
    warnings: 0,
    roundTripErrors: 0,
    roundTripWarnings: 0,
    reason: 'legacy attribute-value context enum is incomplete, but writing is source-identical',
  },
};

export const YAML_TEMPLATE_PARSE_DIVERGENCES: Readonly<Record<string, DiagnosticExpectation>> = {
  '3': {
    errors: 7,
    warnings: 0,
    reason: 'legacy JSON blueprint differs, while its committed YAML remains canonical',
  },
};

export const YAML_ELEMENT_PARSE_DIVERGENCES: Readonly<Record<string, DiagnosticExpectation>> = {
  '1': {
    errors: 1,
    warnings: 0,
    reason: 'legacy attribute-value context enum is incomplete, while its committed YAML remains canonical',
  },
};
