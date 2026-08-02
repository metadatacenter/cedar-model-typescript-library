import { CedarReaders, JsonNode, Template } from '../../../../../../src';

/**
 * `_ui.hidden` is readable for every kind of child, not only dynamic fields.
 *
 * It used to be read by the per-type field readers, which cover the dynamic
 * fields and nothing else. A hidden element or a hidden static field therefore
 * parsed as visible, and any consumer rendering from the parsed model showed
 * something the template says to hide. The declaration also lived on
 * `AbstractDynamicChildDeploymentInfo`, so a static child had nowhere to put it.
 *
 * None of the 94 templates in the shared corpora hides an element or a static
 * field — all 72 hidden children there are dynamic fields — which is why this
 * went unnoticed. The template model permits it regardless.
 */
const field = (name: string, hidden: boolean): JsonNode => ({
  '@type': 'https://schema.metadatacenter.org/core/TemplateField',
  '@context': {},
  type: 'object',
  _ui: hidden ? { inputType: 'textfield', hidden: true } : { inputType: 'textfield' },
  _valueConstraints: { requiredValue: false },
  'schema:name': name,
  'schema:description': '',
});

const staticField = (name: string, hidden: boolean): JsonNode => ({
  '@type': 'https://schema.metadatacenter.org/core/StaticTemplateField',
  '@context': {},
  type: 'object',
  _ui: hidden ? { inputType: 'richtext', _content: 'text', hidden: true } : { inputType: 'richtext', _content: 'text' },
  'schema:name': name,
  'schema:description': '',
});

const element = (name: string, hidden: boolean): JsonNode => ({
  '@type': 'https://schema.metadatacenter.org/core/TemplateElement',
  '@context': {},
  type: 'object',
  _ui: hidden ? { order: [], propertyLabels: {}, propertyDescriptions: {}, hidden: true } : { order: [], propertyLabels: {}, propertyDescriptions: {} },
  required: ['@context', '@id'],
  properties: { '@context': { properties: {} } },
  'schema:name': name,
  'schema:description': '',
});

const templateWith = (children: Record<string, JsonNode>): JsonNode => {
  const names = Object.keys(children);
  const labels: Record<string, string> = {};
  const descriptions: Record<string, string> = {};
  const iriMap: Record<string, JsonNode> = {};
  names.forEach((n) => {
    labels[n] = n;
    descriptions[n] = '';
    iriMap[n] = { enum: [`https://example.org/${n}`] };
  });
  return {
    '@type': 'https://schema.metadatacenter.org/core/Template',
    '@context': {},
    type: 'object',
    _ui: { order: names, propertyLabels: labels, propertyDescriptions: descriptions },
    required: names,
    properties: { '@context': { properties: iriMap }, ...children },
    'schema:name': 'Hidden children',
    'schema:description': '',
  };
};

const read = (source: JsonNode): Template =>
  CedarReaders.json().getFebruary2024().getTemplateReader().readFromObject(source).template;

describe('reading _ui.hidden', () => {
  test('a hidden dynamic field is reported hidden', () => {
    const template = read(templateWith({ Visible: field('Visible', false), Hidden: field('Hidden', true) }));
    expect(template.getChildInfo('Visible')!.hidden).toBe(false);
    expect(template.getChildInfo('Hidden')!.hidden).toBe(true);
  });

  test('a hidden element is reported hidden', () => {
    const template = read(templateWith({ Visible: element('Visible', false), Hidden: element('Hidden', true) }));
    expect(template.getChildInfo('Visible')!.hidden).toBe(false);
    expect(template.getChildInfo('Hidden')!.hidden).toBe(true);
  });

  test('a hidden static field is reported hidden', () => {
    const template = read(templateWith({ Shown: staticField('Shown', false), Gone: staticField('Gone', true) }));
    expect(template.getChildInfo('Shown')!.hidden).toBe(false);
    expect(template.getChildInfo('Gone')!.hidden).toBe(true);
  });

  test('a multi-instance field keeps its hidden flag', () => {
    const source = templateWith({ Many: field('Many', true) });
    const properties = source['properties'] as JsonNode;
    properties['Many'] = { type: 'array', minItems: 1, items: properties['Many'] };
    expect(read(source).getChildInfo('Many')!.hidden).toBe(true);
  });
});
