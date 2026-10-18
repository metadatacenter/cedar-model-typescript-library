import {
  CedarBuilders,
  ComparisonError,
  ComparisonErrorType,
  JsonArtifactParsingResult,
  JsonPath,
  NumberType,
  TemplateValueValidator,
  ValidationFinding,
  ValidationPolicy,
} from '../../../../../src';

describe('validation facts and save policy', () => {
  test.each([
    ['maxValue', 'constraint', 'warning'],
    ['required', 'completeness', 'warning'],
    ['semanticNotChecked', 'verification', 'warning'],
    ['missingProperty', 'structural', 'error'],
    ['anUnknownFutureCode', 'structural', 'error'],
  ] as const)('preserves the default instance severity of %s', (code, category, severity) => {
    expect(ValidationPolicy.category(code)).toBe(category);
    expect(ValidationPolicy.severity(code)).toBe(severity);
    expect(ValidationPolicy.blocksSave(code)).toBe(severity === 'error');
  });

  test('the same value finding is advisory for an instance and blocking for a template default', () => {
    const finding = ValidationPolicy.finding('maxValue', '/Count/@value', 'Above the declared maximum.');
    expect(ValidationPolicy.summarize([finding])).toMatchObject({ structurallyValid: true, canSave: true, isValid: false });
    expect(ValidationPolicy.summarize([finding], 'template')).toMatchObject({ structurallyValid: true, canSave: false, isValid: false });
    expect(ValidationPolicy.severity('maxValue', 'template')).toBe('error');
    expect(ValidationPolicy.severity('missingProperty', 'template')).toBe('error');
  });

  test.each(['passed', 'failed', 'notChecked', 'unavailable'] as const)(
    'retains %s semantic evidence without pretending it passed',
    (status) => {
      const finding: ValidationFinding = {
        code: status === 'passed' ? 'authorityVerified' : status === 'failed' ? 'authorityMembership' : 'semanticUnavailable',
        category: 'verification',
        path: '/Researcher/@id',
        message: 'Authority verification result.',
        verificationStatus: status,
      };
      const report = ValidationPolicy.summarize([finding]);
      expect(report).toEqual({ findings: [finding], structurallyValid: true, canSave: true, isValid: status === 'passed' });
      expect(ValidationPolicy.summarize([finding], 'template').isValid).toBe(status === 'passed');
      if (status === 'passed') expect(ValidationPolicy.blocksSave(finding, 'template')).toBe(false);
      if (status === 'failed') expect(ValidationPolicy.blocksSave(finding, 'template')).toBe(true);
      report.findings.pop();
      expect(ValidationPolicy.summarize([finding]).findings).toEqual([finding]);
    },
  );
});

describe('structured reports alongside legacy parsing diagnostics', () => {
  test('deduplicates a repeated fact while retaining different occurrences and rules', () => {
    const result = new JsonArtifactParsingResult();
    const first = ValidationPolicy.finding('maxValue', '/Visits/0/Count/@value', 'Too large.');
    result.addValidationFinding(first);
    result.addValidationFinding({ ...first, message: 'Repeated by another caller.' });
    result.addValidationFinding({ ...first, path: '/Visits/1/Count/@value' });
    result.addValidationFinding(ValidationPolicy.finding('decimalPlace', first.path, 'Too precise.'));
    expect(result.getValidationFindings()).toHaveLength(3);
    expect(result.getBlueprintComparisonWarningCount()).toBe(3);
    expect(result.wasSuccessful()).toBe(true);
    expect(result.adheresToBlueprint()).toBe(false);
    const snapshot = result.getValidationFindings();
    snapshot.pop();
    expect(result.getValidationFindings()).toHaveLength(3);
    expect(result.getValidationReport()).toMatchObject({ canSave: true, structurallyValid: true, isValid: false });
  });

  test('keeps a supplied compatibility diagnostic without losing its structured path', () => {
    const result = new JsonArtifactParsingResult();
    const path = new JsonPath('a/b~c', 1, '@value');
    const legacy = new ComparisonError('InstanceValidator', ComparisonErrorType.VALUE_MISMATCH, path, 'at most 10', '12');
    const fact = ValidationPolicy.finding('maxValue', path.toPointer(), 'Too large.');
    result.addValidationFinding(fact, 'instance', legacy);
    expect(result.getBlueprintComparisonWarnings()).toEqual([legacy]);
    expect(result.getValidationReport().findings).toEqual([fact]);
    expect(result.getBlueprintComparisonWarnings()[0].errorPath.toString()).toBe('/a/b~c/[1]/@value/');
    expect(result.getValidationReport().findings[0].path).toBe('/a~1b~0c/1/@value');
  });

  test('passed verification remains visible but creates no legacy error or warning', () => {
    const result = new JsonArtifactParsingResult();
    const fact: ValidationFinding = {
      code: 'controlledTermVerified',
      category: 'verification',
      path: '/Disease/@id',
      message: 'Exact membership verified.',
      verificationStatus: 'passed',
    };
    result.addValidationFinding(fact, 'template');
    expect(result.getValidationFindings()).toEqual([fact]);
    expect(result.getBlueprintComparisonErrors()).toEqual([]);
    expect(result.getBlueprintComparisonWarnings()).toEqual([]);
    expect(result.getValidationReport('template')).toEqual({ findings: [fact], structurallyValid: true, canSave: true, isValid: true });
    expect(result.adheresToBlueprint()).toBe(true);
  });

  test('maps legacy structural errors into findings while retaining explicit template errors once', () => {
    const result = new JsonArtifactParsingResult();
    result.addBlueprintComparisonError(
      new ComparisonError('reader', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, new JsonPath('a/b~c', 2, '@type')),
    );
    result.addBlueprintComparisonError(new ComparisonError('reader', ComparisonErrorType.VALUE_MISMATCH, new JsonPath()));
    result.addValidationFinding(
      ValidationPolicy.finding('maxValue', '/properties/Count/_valueConstraints/defaultValue', 'Too large.'),
      'template',
    );
    const report = result.getValidationReport('template');
    expect(report.findings).toHaveLength(3);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'missingProperty', category: 'structural', path: '/a~1b~0c/2/@type' }),
        expect.objectContaining({ code: 'valueShape', category: 'structural', path: '' }),
        expect.objectContaining({ code: 'maxValue', category: 'constraint', path: '/properties/Count/_valueConstraints/defaultValue' }),
      ]),
    );
    expect(report).toMatchObject({ canSave: false, structurallyValid: false, isValid: false });
  });

  test('merges nested parser reports without dropping semantic coverage or legacy diagnostics', () => {
    const parent = new JsonArtifactParsingResult();
    const child = new JsonArtifactParsingResult();
    parent.addValidationFinding(ValidationPolicy.finding('required', '/Title/@value', 'Answer is empty.'));
    child.addValidationFinding(ValidationPolicy.finding('semanticUnavailable', '/Visit/0/Person/@id', 'Authority offline.', 'unavailable'));
    child.addBlueprintComparisonError(
      new ComparisonError('reader', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, new JsonPath('Visit', 0, 'Count', '@type')),
    );
    parent.merge(child);
    expect(parent.getValidationFindings().map((finding) => finding.code)).toEqual(['required', 'semanticUnavailable']);
    expect(parent.getValidationReport().findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/Visit/0/Person/@id', verificationStatus: 'unavailable' }),
        expect.objectContaining({ path: '/Visit/0/Count/@type', category: 'structural' }),
      ]),
    );
    expect(parent.getBlueprintComparisonErrorCount()).toBe(1);
    expect(parent.getBlueprintComparisonWarningCount()).toBe(2);
    expect(parent.wasSuccessful()).toBe(false);
  });
});

describe('portable validation paths', () => {
  test.each(([[], [''], ['a/b~c', 0, '@value'], ['~1', '~0', '', '01']] as const).map((parts) => [parts] as const))(
    'round trips RFC 6901 components %j',
    (parts) => {
      const pointer = ValidationPolicy.pointer(parts);
      expect(JsonPath.fromPointer(pointer).toPointer()).toBe(pointer);
      expect(new JsonPath(...parts).toPointer()).toBe(pointer);
    },
  );

  test('extends an escaped path without re-escaping its existing components', () => {
    const parent = ValidationPolicy.pointer(['Visits/a~b', 1]);
    expect(ValidationPolicy.child(parent, 'Count/~total')).toBe('/Visits~1a~0b/1/Count~1~0total');
    expect(JsonPath.fromPointer('').equal(new JsonPath())).toBe(true);
    expect(JsonPath.fromPointer('/01').getLastComponent()).toBe('01');
  });
});

describe('template definition reports', () => {
  const count = () => ({ _ui: { inputType: 'numeric' }, _valueConstraints: { numberType: 'xsd:int', maxValue: 10, defaultValue: 99 } });

  test.each([null, false, 42, [], 'definition'])('rejects a non-object imported definition %j at the root', (source) => {
    expect(TemplateValueValidator.validateSource(source)).toMatchObject({
      canSave: false,
      structurallyValid: false,
      findings: [expect.objectContaining({ code: 'valueShape', path: '' })],
    });
  });

  test('rejects an instance passed to the template-definition API', () => {
    const instance = CedarBuilders.templateInstanceBuilder().withSchemaName('An instance').build();
    expect(TemplateValueValidator.validate(instance)).toMatchObject({
      canSave: false,
      structurallyValid: false,
      findings: [expect.objectContaining({ code: 'valueShape', path: '' })],
    });
  });

  test('reports a missing array item definition at its structural path', () => {
    expect(TemplateValueValidator.validateSource({ type: 'array' }).findings).toContainEqual(
      expect.objectContaining({ code: 'valueShape', path: '/items' }),
    );
  });

  test.each([
    [null, 3, false],
    [1, null, false],
    [1, 3, false],
    [4, 3, true],
  ] as const)('checks imported occurrence bounds %s..%s independently of defaults', (minItems, maxItems, inconsistent) => {
    const source = { type: 'array', minItems, maxItems, items: count() };
    const before = structuredClone(source);
    const report = TemplateValueValidator.validateSource(source);
    expect(report.findings.some((finding) => finding.code === 'templateConstraint' && finding.path === '/maxItems')).toBe(inconsistent);
    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'maxValue', path: '/items/_valueConstraints/defaultValue' }));
    expect(report.canSave).toBe(false);
    expect(source).toEqual(before);
  });

  test('walks repeated imported elements and escapes field names while ignoring schema metadata', () => {
    const source = {
      properties: {
        '@id': { type: 'string' },
        ignored: null,
        listMetadata: { type: 'array', items: { type: 'string' } },
        'Visit/~': { type: 'array', minItems: 2, maxItems: 1, items: { _ui: {}, properties: { 'Count/~': count() } } },
      },
    };
    expect(TemplateValueValidator.validateSource(source).findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'templateConstraint', path: '/properties/Visit~1~0/maxItems' }),
        expect.objectContaining({
          code: 'maxValue',
          path: '/properties/Visit~1~0/items/properties/Count~1~0/_valueConstraints/defaultValue',
        }),
      ]),
    );
    expect(TemplateValueValidator.validateSource({}).findings).toEqual([]);
  });

  test.each([
    ['controlled', { termUri: 'https://example.org/term+a%2Fb', 'rdfs:label': 'A label' }, '/termUri'],
    ['ext-orcid', 'https://orcid.org/0000-0002-1825-0097', ''],
  ] as const)('makes omitted semantic verification explicit for %s defaults', (inputType, defaultValue, suffix) => {
    const source = { _ui: { inputType }, _valueConstraints: { defaultValue } };
    const report = TemplateValueValidator.validateSource(source);
    expect(report.findings).toContainEqual(
      expect.objectContaining({
        code: 'semanticNotChecked',
        category: 'verification',
        verificationStatus: 'notChecked',
        path: '/_valueConstraints/defaultValue' + suffix,
      }),
    );
    expect(report.isValid).toBe(false);
    expect(source._valueConstraints.defaultValue).toEqual(defaultValue);
  });

  test.each([null, ''])('does not invent a semantic lookup for an empty authority default %j', (defaultValue) => {
    expect(
      TemplateValueValidator.validateSource({ _ui: { inputType: 'ext-orcid' }, _valueConstraints: { defaultValue } }).findings,
    ).toEqual([]);
  });

  test('checks nested model defaults and independently mutated deployment bounds without writing the model', () => {
    const field = CedarBuilders.numericFieldBuilder().withSchemaName('Count').withNumberType(NumberType.INT).withMaxValue(10).build();
    field.valueConstraints.defaultValue = 99; // A retained imported default, deliberately inconsistent.
    const fieldDeployment = field.createDeploymentBuilder('Count').withMultiInstance(true).withMinItems(1).withMaxItems(3).build();
    fieldDeployment.minItems = 4; // Model setters can retain an imported contradiction for correction.
    const element = CedarBuilders.templateElementBuilder().withSchemaName('Visit').addChild(field, fieldDeployment).build();
    const elementDeployment = element.createDeploymentBuilder('Visits').withMultiInstance(true).build();
    const template = CedarBuilders.templateBuilder().withSchemaName('Study').addChild(element, elementDeployment).build();
    const report = TemplateValueValidator.validate(template);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'templateConstraint', path: '/properties/Visits/items/properties/Count/maxItems' }),
        expect.objectContaining({
          code: 'maxValue',
          path: '/properties/Visits/items/properties/Count/items/_valueConstraints/defaultValue',
        }),
      ]),
    );
    expect(report.canSave).toBe(false);
    expect(field.valueConstraints.defaultValue).toBe(99);
    expect(fieldDeployment.minItems).toBe(4);
    expect(TemplateValueValidator.validate(element).findings).toContainEqual(
      expect.objectContaining({ code: 'templateConstraint', path: '/properties/Count/maxItems' }),
    );
    expect(TemplateValueValidator.validate(field).findings).toContainEqual(
      expect.objectContaining({ code: 'maxValue', path: '/_valueConstraints/defaultValue' }),
    );
  });
});
