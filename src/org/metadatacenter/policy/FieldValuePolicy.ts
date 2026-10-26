import { TemporalDefaultPolicy } from './TemporalDefaultPolicy';
import { IdentifierPolicy } from './IdentifierPolicy';
import { ExactDecimal, NumericInput, NumericPolicy } from './NumericPolicy';
import { RegexChecks } from './RegexChecks';
import { TextPolicy } from './TextPolicy';
import { ValidationContext, ValidationFinding, ValidationPolicy } from './ValidationPolicy';

/** Raw field metadata keeps every versioned terminology constraint intact. */
export interface ValidationField {
  _ui?: { inputType?: string; temporalGranularity?: string | null; timezoneEnabled?: boolean; [key: string]: unknown };
  // Raw definitions may contain invalid values: each rule checks the shape it consumes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _valueConstraints?: { [key: string]: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: { [key: string]: any };
  required?: string[];
  additionalProperties?: boolean;
}

/** Local facts shared by model callers and editors. Remote checks are explicit, separate facts. */
export class FieldValuePolicy {
  static readonly authorityTypes = new Set(['ext-orcid', 'ext-ror', 'ext-pfas', 'ext-pubmed', 'ext-rrid', 'ext-nih-grant-id', 'ext-doi']);
  /** Fields that present content rather than take an answer. */
  static readonly staticTypes = new Set(['page-break', 'section-break', 'richtext', 'image', 'youtube']);
  private static readonly integerRanges: Record<string, readonly [string, string]> = {
    'xsd:byte': ['-128', '127'],
    'xsd:short': ['-32768', '32767'],
    'xsd:int': ['-2147483648', '2147483647'],
    'xsd:long': ['-9223372036854775808', '9223372036854775807'],
  };
  static isControlled(field: ValidationField): boolean {
    const c = field._valueConstraints ?? {};
    return (
      ['controlled', 'controlled-term'].includes(field._ui?.inputType ?? '') ||
      (Object.hasOwn(field.properties ?? {}, '@id') && ['ontologies', 'branches', 'classes', 'valueSets'].some((k) => Object.hasOwn(c, k)))
    );
  }
  static isIri(field: ValidationField): boolean {
    const type = field._ui?.inputType ?? '';
    return type === 'link' || this.authorityTypes.has(type) || this.isControlled(field) || Object.hasOwn(field.properties ?? {}, '@id');
  }

  static validateConfiguration(field: ValidationField, path = ''): ValidationFinding[] {
    const c = field._valueConstraints ?? {};
    const out: ValidationFinding[] = [];
    const bad = (key: string, message: string) =>
      out.push(ValidationPolicy.finding('templateConstraint', ValidationPolicy.child(path + '/_valueConstraints', key), message));
    for (const key of ['minLength', 'maxLength', 'decimalPlace']) {
      if (Object.hasOwn(c, key) && (!Number.isInteger(c[key]) || c[key] < 0 || c[key] > 2147483647))
        bad(key, `${key} must be a nonnegative integer.`);
    }
    if (c.minLength != null && c.maxLength != null && c.minLength > c.maxLength) bad('maxLength', 'Minimum length exceeds maximum length.');
    const validBounds = new Set<string>();
    for (const key of ['minValue', 'maxValue']) {
      if (!Object.hasOwn(c, key)) continue;
      try {
        if (typeof c[key] !== 'number' && !ExactDecimal.isExact(c[key])) throw new Error();
        NumericPolicy.value(c[key]);
        validBounds.add(key);
      } catch {
        bad(key, 'Numeric bounds must be finite decimal values.');
      }
    }
    if (validBounds.size === 2 && NumericPolicy.compare(c.minValue, c.maxValue) > 0)
      bad('maxValue', 'Minimum value exceeds maximum value.');
    if (field._ui?.inputType === 'numeric') {
      const type = c.numberType;
      const integral = Object.hasOwn(this.integerRanges, type);
      if (!integral && !['xsd:float', 'xsd:double', 'xsd:decimal'].includes(type))
        bad('numberType', 'A numeric field requires a recognized datatype.');
      const validPrecision = Number.isInteger(c.decimalPlace) && c.decimalPlace >= 0 && c.decimalPlace <= 2147483647;
      if (integral && validPrecision && c.decimalPlace !== 0)
        bad('decimalPlace', 'Integer datatypes cannot declare fractional decimal places.');
      for (const key of validBounds) {
        if (!integral && !['xsd:float', 'xsd:double', 'xsd:decimal'].includes(type)) continue;
        if (this.numeric({ numberType: type }, c[key], '', 'template').some((f) => f.code === 'numberType'))
          bad(key, 'The bound is outside its numeric datatype.');
        else if (validPrecision && NumericPolicy.fractionalDigits(c[key]) > c.decimalPlace)
          bad(key, 'The bound exceeds the declared decimal precision.');
      }
    }
    if (Object.hasOwn(c, 'regex')) {
      if (typeof c.regex !== 'string') bad('regex', 'A pattern must be a string.');
      else if (c.regex !== '') out.push(...this.regex(c.regex, null, path + '/_valueConstraints/regex'));
    }
    return out;
  }

  static validate(field: ValidationField, value: unknown, path = '', context: ValidationContext = 'instance'): ValidationFinding[] {
    if (value === null || value === undefined || value === '') return [];
    const c = field._valueConstraints ?? {};
    const type = field._ui?.inputType;
    const out: ValidationFinding[] = [];
    const add = (code: string, message: string) => out.push(ValidationPolicy.finding(code, path, message));
    if (typeof value !== 'string' && !(context === 'template' && type === 'numeric')) {
      add('valueShape', 'A populated field value must be a string.');
      return out;
    }
    const text = String(value);
    if (c.minLength != null && TextPolicy.codePointLength(text) < c.minLength) add('minLength', `Shorter than the minimum ${c.minLength}.`);
    if (c.maxLength != null && TextPolicy.codePointLength(text) > c.maxLength) add('maxLength', `Longer than the maximum ${c.maxLength}.`);
    if (typeof c.regex === 'string' && c.regex !== '') out.push(...this.regex(c.regex, text, path));
    if (
      type === 'email' &&
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
        text,
      )
    )
      add('email', 'Not a valid email address.');
    if (type === 'phone-number' && !/^[+0-9 \t\-()]+$/.test(text)) add('phoneNumber', 'Not a valid phone number.');
    if (this.isIri(field)) {
      if (!IdentifierPolicy.isValidAuthoringIri(text, true)) add('iriMalformed', 'Not a valid absolute IRI.');
    }
    if (type === 'numeric') out.push(...this.numeric(c, value as NumericInput, path, context));
    if (type === 'temporal') {
      if (context === 'template') {
        try {
          TemporalDefaultPolicy.assertValid(c.temporalType ?? null, field._ui?.temporalGranularity ?? null, text);
        } catch (error) {
          add('temporalType', error instanceof Error ? error.message : 'Invalid temporal default.');
        }
        if (/(Z|[+-]\d{2}:\d{2})$/.test(text) && field._ui?.timezoneEnabled !== true)
          add('timezone', 'Carries a timezone offset but none is enabled.');
      } else out.push(...this.temporal(field, text, path));
    }
    if (Array.isArray(c.literals) && c.literals.length && !c.literals.some((v: { label?: unknown } | null) => v?.label === text))
      add('choiceMembership', 'Not one of the declared options.');
    return out;
  }

  /** Empty slots are distinct from malformed typed atoms and missing structural properties. */
  static validateNode(field: ValidationField, node: unknown, path = ''): ValidationFinding[] {
    const out: ValidationFinding[] = [];
    const add = (code: string, property: string | null, message: string) =>
      out.push(ValidationPolicy.finding(code, property === null ? path : ValidationPolicy.child(path, property), message));
    const c = field._valueConstraints ?? {};
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      add('valueShape', null, 'A field slot must be an object.');
      return out;
    }
    const atom = node as Record<string, unknown>;
    // A closed schema refuses a key it does not declare, as JSON Schema does.
    const closed = field.additionalProperties === false;
    const declares = (property: string) => !closed || Object.hasOwn(field.properties ?? {}, property);
    if (this.staticTypes.has(field._ui?.inputType ?? '')) {
      // A static field takes no answer, so the Java validator judges its slot by the schema alone.
      for (const property of Object.keys(atom).filter((key) => !declares(key)))
        add('valueShape', property, 'The template does not declare this property.');
      return out;
    }
    for (const property of ['rdfs:label', 'skos:prefLabel', 'skos:notation', '@language']) {
      if (Object.hasOwn(atom, property) && atom[property] !== null && typeof atom[property] !== 'string') {
        add('valueShape', property, `${property} must be a string or null.`);
      }
    }
    // @id and @value have shape rules of their own, which report them when undeclared.
    for (const property of Object.keys(atom)) {
      if (property !== '@id' && property !== '@value' && !declares(property))
        add('valueShape', property, 'The template does not declare this property.');
    }
    if (Object.hasOwn(atom, '@id') && (typeof atom['@id'] !== 'string' || atom['@id'] === '')) {
      add('iriMalformed', '@id', 'A populated IRI must be a nonempty string.');
      return out;
    }
    const missing = (field.required ?? []).filter((property) => !Object.hasOwn(atom, property));
    for (const property of missing) add('missingProperty', property, `The field slot must contain ${property}.`);
    if (missing.length) return out;
    if (Object.keys(atom).length === 0) {
      if (!this.isIri(field)) {
        add('missingProperty', '@value', 'A literal field slot must contain @value.');
        return out;
      }
      if (c.requiredValue === true) add('required', null, 'A value is required.');
      return out;
    }
    if (this.isIri(field)) {
      // No IRI field declares @value, so where the schema is closed even a null one is refused.
      if (Object.hasOwn(atom, '@value') && (atom['@value'] !== null || !declares('@value')))
        add('valueShape', '@value', 'An IRI field cannot contain a literal value.');
      if (!Object.hasOwn(atom, '@id')) {
        // A value without @id is unfilled, whatever else it holds: a null or empty label, or a class
        // as @type. Only a controlled term's label claims a term, and one without an IRI names none.
        if (c.requiredValue === true) add('required', null, 'A value is required.');
        const label = atom['rdfs:label'];
        if (this.isControlled(field) && typeof label === 'string' && label !== '')
          add('controlledStructure', null, 'A controlled-term label requires an IRI.');
        return out;
      }
      out.push(...this.validate(field, atom['@id'], path + '/@id'));
      return out;
    }
    if (Object.hasOwn(atom, '@id')) {
      add('valueShape', '@id', 'A literal field cannot contain an IRI value.');
      return out;
    }
    if (!Object.hasOwn(atom, '@value')) {
      add('valueShape', '@value', 'A literal field requires @value.');
      return out;
    }
    const value = atom['@value'];
    if (value === null || value === '') {
      if (c.requiredValue === true) add('required', '@value', 'A value is required.');
      return out;
    }
    const expectedType = field._ui?.inputType === 'numeric' ? c.numberType : field._ui?.inputType === 'temporal' ? c.temporalType : null;
    const canonicalType = (value: unknown) =>
      typeof value === 'string' ? value.replace('http://www.w3.org/2001/XMLSchema#', 'xsd:') : value;
    if (expectedType != null && canonicalType(atom['@type']) !== canonicalType(expectedType))
      add('valueType', '@type', `The value must declare ${expectedType}.`);
    out.push(...this.validate(field, value, path + '/@value'));
    return out;
  }

  static validateDefault(field: ValidationField, path = ''): ValidationFinding[] {
    const c = field._valueConstraints ?? {};
    const value = c.defaultValue;
    if (value == null) return [];
    const at = path + '/_valueConstraints/defaultValue';
    if (this.isControlled(field)) {
      if (
        !value ||
        typeof value !== 'object' ||
        typeof value.termUri !== 'string' ||
        value.termUri === '' ||
        typeof value['rdfs:label'] !== 'string' ||
        value['rdfs:label'] === ''
      ) {
        return [ValidationPolicy.finding('controlledStructure', at, 'A controlled default requires termUri and rdfs:label.')];
      }
      return this.validate(field, value.termUri, at + '/termUri', 'template');
    }
    return this.validate(field, value, at, 'template');
  }

  /** Synchronous construction checks. Async regex/semantic coverage remains explicit in reports. */
  static assertConsistent(field: ValidationField): void {
    // Builder optionals use null; serialized definitions omit absent constraints.
    const declared = {
      ...field,
      _valueConstraints: Object.fromEntries(Object.entries(field._valueConstraints ?? {}).filter(([, value]) => value != null)),
    };
    const findings = [...this.validateConfiguration(declared), ...this.validateDefault(declared)];
    const failure = findings.find((f) => ValidationPolicy.blocksSave(f.code, 'template'));
    if (failure) throw new Error(`${failure.message} (${failure.path})`);
  }

  private static regex(pattern: string, value: string | null, path: string): ValidationFinding[] {
    const result = RegexChecks.inspect(pattern, value);
    if (result === 'valid' || result === 'match' || (result === 'invalid' && value !== null)) return [];
    if (result === 'mismatch') return [ValidationPolicy.finding('regex', path, 'Does not match the field pattern.')];
    if (result === 'invalid') return [ValidationPolicy.finding('templateConstraint', path, 'The field pattern is invalid.')];
    return [
      ValidationPolicy.finding(
        result === 'pending' ? 'regexPending' : 'regexEvaluation',
        path,
        result === 'pending' ? 'Pattern validation is pending.' : `Pattern validation could not finish (${result}).`,
        result === 'pending' ? 'notChecked' : 'unavailable',
      ),
    ];
  }

  private static numeric(
    c: NonNullable<ValidationField['_valueConstraints']>,
    value: NumericInput,
    path: string,
    context: ValidationContext,
  ): ValidationFinding[] {
    const out: ValidationFinding[] = [];
    const add = (code: string, message: string) => out.push(ValidationPolicy.finding(code, path, message));
    const type = c.numberType ?? 'xsd:decimal';
    const bounds = this.integerRanges[type];
    const text = String(value);
    if (
      context === 'instance' &&
      (bounds ? !/^[+-]?(?:0|[1-9][0-9]*)$/.test(text) : !/^[+-]?(?:(?:0|[1-9][0-9]*)(?:\.[0-9]*)?|\.[0-9]+)$/.test(text))
    ) {
      add('numberType', `Not a valid ${type}.`);
      return out;
    }
    try {
      if (!bounds && !['xsd:float', 'xsd:double', 'xsd:decimal'].includes(type)) throw new Error('Unknown numeric datatype.');
      NumericPolicy.value(value);
      if (
        bounds &&
        (!NumericPolicy.isInteger(value) || NumericPolicy.compare(value, bounds[0]) < 0 || NumericPolicy.compare(value, bounds[1]) > 0)
      ) {
        add('numberType', `Outside the range of ${type}.`);
        return out;
      }
      if (context === 'template' && (type === 'xsd:float' || type === 'xsd:double')) {
        const magnitude = text.replace(/^-/, '');
        const maximum = type === 'xsd:float' ? '3.4028234663852886e38' : '1.7976931348623157e308';
        const minimum = type === 'xsd:float' ? '1.401298464324817e-45' : '4.9e-324';
        if (
          NumericPolicy.compare(magnitude, maximum) > 0 ||
          (NumericPolicy.compare(magnitude, 0) !== 0 && NumericPolicy.compare(magnitude, minimum) < 0)
        ) {
          add('numberType', `Outside the range of ${type}.`);
          return out;
        }
      }
      const digits = context === 'instance' ? (text.split('.')[1]?.length ?? 0) : NumericPolicy.fractionalDigits(value);
      if (c.decimalPlace != null && digits > c.decimalPlace) add('decimalPlace', `More than ${c.decimalPlace} decimal places.`);
      if ((typeof c.minValue === 'number' || ExactDecimal.isExact(c.minValue)) && NumericPolicy.compare(value, c.minValue) < 0)
        add('minValue', `Below the minimum ${c.minValue}.`);
      if ((typeof c.maxValue === 'number' || ExactDecimal.isExact(c.maxValue)) && NumericPolicy.compare(value, c.maxValue) > 0)
        add('maxValue', `Above the maximum ${c.maxValue}.`);
    } catch {
      add('numberType', 'Not a finite decimal value.');
    }
    return out;
  }

  private static temporal(field: ValidationField, text: string, path: string): ValidationFinding[] {
    const out: ValidationFinding[] = [];
    const add = (code: string, message: string) => out.push(ValidationPolicy.finding(code, path, message));
    const type = field._valueConstraints?.temporalType;
    const granularity = field._ui?.temporalGranularity;
    const offset = text.match(/(Z|[+-]\d{2}:\d{2})$/)?.[0];
    const rest = offset ? text.slice(0, -offset.length) : text;
    if (offset) {
      if (offset !== 'Z') {
        const hour = Number(offset.slice(1, 3)),
          minute = Number(offset.slice(4));
        if (hour > 14 || minute > 59 || (hour === 14 && minute !== 0)) add('timezoneOffset', 'Not a valid xsd timezone offset.');
      }
      if (field._ui?.timezoneEnabled !== true) add('timezone', 'Carries a timezone offset but none is enabled.');
    }
    const date = /^(\d{4})-(\d{2})-(\d{2})$/;
    const time = /^(\d{2}):(\d{2})(?::(\d{2}))?(\.\d+)?$/;
    const parts = rest.split('T');
    const datePart = type === 'xsd:time' ? null : parts[0];
    const timePart = type === 'xsd:time' ? rest : parts.length === 2 ? parts[1] : null;
    const validShape =
      type === 'xsd:date'
        ? parts.length === 1 && date.test(rest)
        : type === 'xsd:time'
          ? time.test(rest)
          : type === 'xsd:dateTime'
            ? parts.length === 2 && date.test(parts[0]) && time.test(parts[1])
            : false;
    if (!validShape) {
      add('temporalType', `Not a valid ${type}.`);
      return out;
    }
    const d = datePart?.match(date),
      t = timePart?.match(time);
    if (d) {
      const year = Number(d[1]),
        month = Number(d[2]),
        day = Number(d[3]);
      const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (month < 1 || month > 12 || day < 1 || day > days[month - 1]) add('temporalCalendar', 'Not a real calendar date.');
    }
    if (t && (Number(t[1]) > 23 || Number(t[2]) > 59 || Number(t[3] ?? 0) > 59)) add('temporalCalendar', 'Not a real time of day.');
    if (granularity) {
      let wrong = d && ((granularity === 'year' && (d[2] !== '01' || d[3] !== '01')) || (granularity === 'month' && d[3] !== '01'));
      if (t) {
        const midnight = t[1] === '00' && t[2] === '00' && (t[3] == null || t[3] === '00') && t[4] == null;
        wrong ||= ['year', 'month', 'day'].includes(granularity) && !(type === 'xsd:dateTime' && midnight);
        wrong ||= (granularity === 'second' || granularity === 'decimalSecond') && t[3] == null;
        wrong ||= granularity === 'decimalSecond' && t[4] == null;
        wrong ||= granularity === 'hour' && (t[2] !== '00' || (t[3] != null && t[3] !== '00') || t[4] != null);
        wrong ||= granularity === 'minute' && ((t[3] != null && t[3] !== '00') || t[4] != null);
        wrong ||= granularity === 'second' && t[4] != null;
      }
      if (wrong) add('temporalGranularity', `Does not match ${granularity} granularity.`);
    }
    return out;
  }
}
