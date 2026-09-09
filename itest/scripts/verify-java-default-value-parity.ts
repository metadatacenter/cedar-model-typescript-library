/**
 * Checks that this library accepts a declared default exactly where the Java
 * artifact library does, and writes it in the same shape.
 *
 * The Java library settles the question and states it in five sealed interfaces.
 * A `permits` clause is a closed list the compiler enforces, so a field type
 * cannot be given a default there without being named in one, and cannot be
 * removed from one without every implementor being changed. That makes those
 * clauses the one place worth reading, and reading them is what this script
 * does: no list of field types is written down here.
 *
 * What is written down here is the correspondence between the two libraries'
 * names — Java's `OrcidField` is this library's `extOrcidFieldBuilder`, and
 * Java's one `ListField` is this library's two list builders. That table is
 * required to be total in both directions, so a field type added to either
 * library and not the other fails rather than passing unnoticed.
 *
 * Needs the sibling Java repository, in the way `verify:java-lock:source` does.
 * Run it from the repository root:
 *
 *   npm run verify:java-defaults
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  CedarBuilders,
  CedarWriters,
  ControlledTermDefaultValueBuilder,
  ControlledTermOntologyBuilder,
  Iri,
  NumberType,
  TemplateField,
  TemporalGranularity,
  TemporalType,
} from '../../src';

/** The shape of a declared default, as the Java library's five interfaces divide them. */
type DefaultShape = 'literal' | 'iri' | 'numeric' | 'temporal' | 'controlledTerm' | 'none';

const JAVA_INTERFACES: ReadonlyArray<readonly [string, DefaultShape]> = [
  ['LiteralDefaultableFieldBuilder', 'literal'],
  ['IriDefaultableFieldBuilder', 'iri'],
  ['NumericDefaultableFieldBuilder', 'numeric'],
  ['TemporalDefaultableFieldBuilder', 'temporal'],
  ['ControlledTermDefaultableFieldBuilder', 'controlledTerm'],
];

/** How each shape reads in a report. */
const SHAPE_NAMES: Readonly<Record<DefaultShape, string>> = {
  literal: 'a literal',
  iri: 'an IRI',
  numeric: 'a number',
  temporal: 'a temporal literal',
  controlledTerm: 'a term and its label',
  none: 'no',
};

/**
 * Which builder factory here corresponds to which Java field class.
 *
 * One Java class may answer to two factories: Java models a single- and a
 * multi-select list as one `ListField` with a flag, and this library gives each
 * its own builder. Both inherit the same default, which is the claim being made.
 */
const CORRESPONDENCE: Readonly<Record<string, ReadonlyArray<string>>> = {
  TextField: ['textFieldBuilder'],
  TextAreaField: ['textAreaBuilder'],
  EmailField: ['emailFieldBuilder'],
  PhoneNumberField: ['phoneNumberFieldBuilder'],
  RadioField: ['radioFieldBuilder'],
  CheckboxField: ['checkboxFieldBuilder'],
  ListField: ['singleChoiceListFieldBuilder', 'multipleChoiceListFieldBuilder'],
  LinkField: ['linkFieldBuilder'],
  OrcidField: ['extOrcidFieldBuilder'],
  RorField: ['extRorFieldBuilder'],
  PfasField: ['extPfasFieldBuilder'],
  RridField: ['extRridFieldBuilder'],
  PubMedField: ['extPubmedFieldBuilder'],
  NihGrantIdField: ['extNihGrantIdFieldBuilder'],
  DoiField: ['extDoiFieldBuilder'],
  NumericField: ['numericFieldBuilder'],
  TemporalField: ['temporalFieldBuilder'],
  ControlledTermField: ['controlledTermFieldBuilder'],
  AttributeValueField: ['attributeValueFieldBuilder'],
  ImageField: ['imageFieldBuilder'],
  RichTextField: ['richTextFieldBuilder'],
  YouTubeField: ['youtubeFieldBuilder'],
  SectionBreakField: ['sectionBreakFieldBuilder'],
  PageBreakField: ['pageBreakFieldBuilder'],
};

const failures: string[] = [];
const fail = (message: string): void => {
  failures.push(message);
};

const javaCore = (): string => {
  const root = path.resolve(__dirname, '../../..', 'cedar-artifact-library');
  const core = path.join(root, 'src/main/java/org/metadatacenter/artifacts/model/core');
  if (!fs.existsSync(core)) {
    console.error(`The Java artifact library is not beside this repository: expected ${core}`);
    console.error('Clone metadatacenter/cedar-artifact-library as a sibling, then run this again.');
    process.exit(2);
  }
  return core;
};

/**
 * The field classes a sealed interface permits, as Java field class names.
 *
 * A permits entry reads `TextField.TextFieldBuilder`; the outer class is the
 * field type. An interface with no `permits` clause would mean Java had stopped
 * closing the set, which is worth failing over rather than reading as an empty
 * list.
 */
const permittedBy = (core: string, interfaceName: string): string[] => {
  const source = path.join(core, `${interfaceName}.java`);
  if (!fs.existsSync(source)) {
    fail(`Java no longer declares ${interfaceName}; the shapes this script compares have changed.`);
    return [];
  }
  const text = fs.readFileSync(source, 'utf8');
  const clause = /\bpermits\s+([^{]+)\{/.exec(text);
  if (clause === null) {
    fail(`${interfaceName} has no permits clause, so Java no longer closes the set of defaultable field types.`);
    return [];
  }
  return clause[1]
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => entry.split('.')[0]);
};

/** Every field class the Java library declares, which is every `*Field.java` in core. */
const javaFieldClasses = (core: string): string[] =>
  fs
    .readdirSync(core)
    .filter((name) => /^[A-Za-z]+Field\.java$/.test(name))
    .map((name) => name.replace(/\.java$/, ''))
    .sort();

const core = javaCore();

// What Java says, read from Java.
const shapeByJavaClass = new Map<string, DefaultShape>();
for (const [interfaceName, shape] of JAVA_INTERFACES) {
  for (const javaClass of permittedBy(core, interfaceName)) {
    const existing = shapeByJavaClass.get(javaClass);
    if (existing !== undefined) {
      fail(`Java permits ${javaClass} in two default shapes at once: ${existing} and ${shape}.`);
    }
    shapeByJavaClass.set(javaClass, shape);
  }
}

const declared = javaFieldClasses(core);
for (const javaClass of declared) {
  if (!(javaClass in CORRESPONDENCE)) {
    fail(`Java declares field type ${javaClass}, which this script cannot match to a builder here.`);
  }
}
for (const javaClass of Object.keys(CORRESPONDENCE)) {
  if (!declared.includes(javaClass)) {
    fail(`This script names Java field type ${javaClass}, which the Java library no longer declares.`);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const named = (builder: any): any =>
  builder
    .withAtId('https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000')
    .withTitle('Declared default')
    .withDescription('Exercises declared defaults')
    .withSchemaName('Declared default')
    .withSchemaDescription('Exercises declared defaults');

/** A field carrying a default of the shape Java says its type takes. */
const built = (factory: string, shape: DefaultShape): TemplateField => {
  const builder = named((CedarBuilders as any)[factory]());
  switch (shape) {
    case 'literal':
      return builder.withDefaultValue('Alpha').build();
    case 'iri':
      return builder.withDefaultValue(new Iri('https://example.org/default-identifier')).build();
    case 'numeric':
      return builder.withNumberType(NumberType.DECIMAL).withDefaultValue(42.5).build();
    case 'temporal':
      return builder
        .withTemporalType(TemporalType.DATE)
        .withTemporalGranularity(TemporalGranularity.DAY)
        .withDefaultValue('2026-08-20')
        .build();
    case 'controlledTerm':
      return builder
        .addOntology(
          new ControlledTermOntologyBuilder()
            .withUri(new Iri('https://data.bioontology.org/ontologies/DOID'))
            .withAcronym('DOID')
            .withName('Human Disease Ontology')
            .build(),
        )
        .withDefaultValue(
          new ControlledTermDefaultValueBuilder().withTermUri(new Iri('https://example.org/term/1')).withRdfsLabel('Melanoma').build(),
        )
        .build();
    case 'none':
      return builder.build();
  }
};

let checked = 0;
for (const [javaClass, factories] of Object.entries(CORRESPONDENCE)) {
  const shape = shapeByJavaClass.get(javaClass) ?? 'none';

  for (const factory of factories) {
    const factoryFunction = (CedarBuilders as any)[factory];
    if (typeof factoryFunction !== 'function') {
      fail(`This library has no builder factory ${factory}, named for Java's ${javaClass}.`);
      continue;
    }
    const setter = (factoryFunction() as any).withDefaultValue;

    if (shape === 'none') {
      if (setter !== undefined) {
        fail(`${factory} accepts a default value; Java's ${javaClass} permits none.`);
      } else {
        checked++;
      }
      continue;
    }
    if (typeof setter !== 'function') {
      fail(`${factory} has no withDefaultValue; Java's ${javaClass} takes ${SHAPE_NAMES[shape]} default.`);
      continue;
    }

    // The written shape, which is the half of the agreement a document records.
    const field = built(factory, shape);
    const json = JSON.parse(CedarWriters.json().getStrict().getFieldWriterForField(field).getAsJsonString(field));
    const constraints = json._valueConstraints ?? json.items?._valueConstraints;
    const written = constraints?.defaultValue;
    const yaml = CedarWriters.yaml().getStrict().getFieldWriterForField(field).getAsYamlString(field);

    if (shape === 'controlledTerm') {
      // Java renders `{termUri, rdfs:label}` in JSON and `{value, label}` in YAML.
      if (typeof written !== 'object' || written === null || typeof written.termUri !== 'string') {
        fail(`${factory} writes ${JSON.stringify(written)} as its JSON default; Java writes a termUri and label pair.`);
      } else if (typeof written['rdfs:label'] !== 'string') {
        fail(`${factory} writes a JSON default with no rdfs:label; Java's carries one.`);
      } else if (!/\n\s*default:\n\s*value:/.test(yaml)) {
        fail(`${factory} does not write a YAML default of a value and a label; Java does.`);
      } else {
        checked++;
      }
      continue;
    }

    // Every other shape is a scalar under the same key in both serializations.
    // Numeric is a string there too: CEDAR's own schema admits a string or a
    // term object and rejects a bare JSON number, which is why Java renders the
    // number as its string form.
    if (typeof written !== 'string') {
      fail(`${factory} writes ${JSON.stringify(written)} as its JSON default; Java writes a string.`);
    } else if (!/\n\s*default: /.test(yaml)) {
      fail(`${factory} writes no YAML default; Java writes one under \`default\`.`);
    } else {
      checked++;
    }
  }
}

const counted = new Map<DefaultShape, number>();
for (const [javaClass, shape] of shapeByJavaClass) {
  if (javaClass in CORRESPONDENCE) {
    counted.set(shape, (counted.get(shape) ?? 0) + 1);
  }
}
for (const [interfaceName, shape] of JAVA_INTERFACES) {
  console.log(`${interfaceName}: ${counted.get(shape) ?? 0} field types take ${SHAPE_NAMES[shape]} default`);
}

if (failures.length > 0) {
  console.error('');
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  console.error(
    `\nDefault value parity with the Java artifact library failed with ${failures.length} mismatch${failures.length === 1 ? '' : 'es'}.`,
  );
  process.exitCode = 1;
} else {
  console.log(`\nDefault value parity with the Java artifact library holds (${checked} builders checked).`);
}
