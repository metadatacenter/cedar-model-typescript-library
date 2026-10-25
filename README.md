# CEDAR Model TypeScript Library

[![Test](https://github.com/metadatacenter/cedar-model-typescript-library/actions/workflows/test.yml/badge.svg?branch=develop)](https://github.com/metadatacenter/cedar-model-typescript-library/actions/workflows/test.yml)

The CEDAR Model TypeScript Library is a TypeScript implementation of the
[CEDAR](https://metadatacenter.org/) artifact model. It provides typed models,
builders, readers, writers, and validators for CEDAR templates, elements, fields,
and metadata instances.

The library reads and writes the JSON, JSON-LD, and YAML representations used by
CEDAR. Applications can use the same model to construct artifacts, parse existing
artifacts, validate metadata instances, and translate between serializations.

For an introduction to the API and examples covering fields, elements, templates,
instances, readers, and writers, see the
[CEDAR Model TypeScript Library documentation](https://metadatacenter.readthedocs.io/en/latest/developer-guide/cedar-model-typescript-library/).

This README covers installing, building, and testing the library.

## Installing the Library

Releases are published to npmjs.org as
[`cedar-model-typescript-library`](https://www.npmjs.com/package/cedar-model-typescript-library):

```shell
npm install cedar-model-typescript-library
```

The package includes CommonJS and ES module bundles together with TypeScript
declarations. Import its public API from the package entry point:

```typescript
import {
  CedarReaders,
  CedarWriters,
  JsonTemplateReaderResult,
  Template,
} from 'cedar-model-typescript-library';

export function jsonTemplateToYaml(templateJson: string): string {
  const result: JsonTemplateReaderResult = CedarReaders
    .json()
    .getStrict()
    .getTemplateReader()
    .readFromString(templateJson);

  const errorCount = result.parsingResult.getBlueprintComparisonErrorCount();
  if (errorCount > 0) {
    throw new Error(`Template contains ${errorCount} parsing errors`);
  }

  const template: Template = result.template;

  return CedarWriters
    .yaml()
    .getStrict()
    .getTemplateWriter()
    .getAsYamlString(template);
}
```

Reader results also contain a parsing report. Applications that accept external
artifacts should inspect its errors and warnings before using the parsed artifact.

## Paragraph length constraints

Use the paragraph builder to set the same minimum and maximum lengths supported
by Java's `TextAreaField`:

```typescript
import { CedarBuilders, TextArea } from 'cedar-model-typescript-library';

const paragraph: TextArea = CedarBuilders.textAreaBuilder()
  .withSchemaName('Summary')
  .withMinLength(20)
  .withMaxLength(500)
  .build();
```

Both limits are optional; pass `null` to clear one. Zero is retained as an explicit
limit. JSON, full YAML and compact YAML preserve the limits, including on nested
and repeated fields. These describe character lengths, independently of the
number of field occurrences. Paragraph builders do not expose a regex constraint.

## Canonical schema output

Standalone attribute-value fields use Java's array envelope (`type: array`, `minItems: 0`,
`items: <field definition>`), just like deployed groups. The JSON reader also accepts the
historical unwrapped definition.

Generated templates permit optional instance `_annotations` and its optional `@nest` context
mapping. Annotation entries follow the existing CEDAR meta-schema: an IRI object or a literal
value object, with no extra properties. These declarations are platform metadata, not child fields.
Older templates without the declarations remain readable; writing them adds the declarations.

Existing JavaScript `number` inputs retain Java 17's decimal spelling compatibility. Raw JSON/YAML
and numeric-string builder inputs preserve exact decimal values, including integers beyond 2^53.
`NumericValue` is a `number` or immutable `ExactDecimal`; use `NumericPolicy.compare` for comparisons,
`String(value)` for display, and `JsonSourcePolicy.stringify` for portable exact JSON serialization.
Bounds stay JSON numbers and CEDAR numeric defaults stay strings. Supplying an already-rounded
JavaScript number cannot recover the original digits; use a raw source or a string builder argument.

Raw readers reject duplicate decoded keys, trailing JSON, multiple YAML documents, nonfinite numbers,
custom YAML tags and recursive aliases. YAML uses core scalar resolution: `yes` is a string, `012`
is decimal twelve, and timestamps stay strings until their model property reads them. Keys retain
their exact spelling. An instance field value is always a string, so an unquoted number or boolean
in one keeps the text it was written with, and `value: 007` reads as `"007"`. The YAML instance
reader refuses what the Java reader refuses in an instance's data. A null, an empty mapping or an
empty list is refused there, except a null value beside a label, a preferred label or a notation,
which reads as no value. A field value must be a string, a number or a boolean, and a child or an
attribute must be a mapping. Malformed sources raise an error; readers never replace them with
empty artifacts.
`JsonSourcePolicy` is also available from `/policy`; `YamlSourcePolicy` is in the full package.
Browser bundlers resolve `/policy` to its ES module bundle; CommonJS consumers retain the
CommonJS entry point.

`TimestampPolicy` and `IsoDate` preserve the source calendar, explicit UTC offset and up to nine
fractional-second digits. Missing offsets and impossible dates are rejected. Minute-only times,
case-insensitive T/Z and legacy colonless offsets remain accepted and render canonically. Temporal
field answers follow their own declared type and precision; they are not provenance timestamps.

## Unicode field identifiers

JSON `@id` and YAML `id` field values accept RFC 3987 Unicode IRI characters without normalizing
the stored string. This includes U+00A0 in an ontology term. Ordinary ASCII spaces, controls,
malformed percent escapes, lone surrogates and noncharacters are rejected. Private-use characters
are permitted only in the query component. Raw Unicode and percent-encoded identifiers remain
distinct, as RDF identity requires. Artifact and element-occurrence identifiers retain their
existing URI rules.

## Building

Use Node 24.22.1, which `.nvmrc` and CI both specify:

```shell
nvm use
npm ci
npm run build
```

The build writes the publishable package to `dist/`. It contains the CommonJS and
ES module bundles, source maps, TypeScript declarations, package manifest,
license, and this README.

For local development, rebuild when source files change:

```shell
npm run build:watch
```

To make the built package available to a local consumer through npm linking:

```shell
npm run build
npm run link
```

Then run `npm link cedar-model-typescript-library` in the consuming project.

## Testing

Run the same checks exercised by continuous integration:

```shell
npm run lint
npm run typecheck
npm run test:coverage
npm run parity:yaml
npm run parity:json
npm run test:package
```

`npm run test:ci` runs all six checks above concurrently within
`CEDAR_TEST_WORKERS` (1–16; by default half the available CPUs, capped at 8).
Use `CEDAR_TEST_WORKERS=1 npm run test:ci` for serial diagnosis. Coverage gets
most of the budget; parity runs use private temporary output trees, and only
packaging writes `dist/`. Fixture generation completes before any checks start, since parity and Jest
read the same generated case module.
Every stage reports its elapsed time, and any failed check fails the gate.
Run concurrent gates in separate checkouts, not against the same output tree.

The unit suite covers the model and serialization behavior. The parity gates
compare the TypeScript library with the Java CEDAR Artifact Library over the
vendored JSON and YAML corpora.

The two libraries must also reach the same verdict on every instance.
`itest/InstanceVerdictConcordance.spec.ts` checks that `InstanceValidator`'s
save decision equals the verdict of the Java validation library, which the
server applies to every write, on each corpus instance that has its template
beside it. Further cases probe shapes the corpus holds no example of: a corpus
case whose instance, and sometimes template, is changed by a few JSON Patch
operations, for instance into an unfilled controlled term or a template that
requires fewer children. Each is judged against the stored template, as the
server judges it. The Java verdicts are recorded in
`itest/resources/concordance/instance-verdicts.json` by cedar-development's
`ops/cedar_corpus_instance_verdicts.py`, with a lock naming the validator and
corpus commits; regenerate them after either changes. A case on which this
library still disagrees is listed as an open defect in the spec, and fixing it
makes the spec fail until the entry is removed.

`npm run test:package` builds the package that would be published, packs and
installs it into an isolated consumer, and exercises its CommonJS bundle, ES
module bundle, and TypeScript declarations.

## Releasing

Release preparation and publication are documented in the
[CEDAR npmjs Release Runbook](https://github.com/metadatacenter/cedar-development/blob/develop/ops/NPMJS-RELEASE-RUNBOOK.md),
which covers this library and the embeddable editor together. The release
command publishes `dist/`, not the repository root.

## License

The CEDAR Model TypeScript Library is released under the
[BSD 2-Clause License](https://github.com/metadatacenter/cedar-model-typescript-library/blob/main/license.txt).

Controlled-term ontology constraints preserve a nondefault service address in YAML
as `sourceUri`, separately from the canonical `sourceIri`. When `sourceUri` is
absent, the reader retains compatibility with existing YAML by deriving the usual
BioPortal address from `sourceAcronym`.

Regular-expression evaluation is asynchronous. `RegexPolicy` in the full package
and `/policy` evaluates `^(?:pattern)$` with no flags in a worker, including
compilation. `await policy.evaluate(pattern, value)` returns `match`, `mismatch`,
`invalid`, or an operational verdict; passing `null` checks compilation only and
returns `valid` when it succeeds. Empty optional answers are the caller's concern.
Never treat `timeout`, `unavailable`, `limit`, or `cancelled` as a match.

The default execution deadline is 250 ms after a worker announces readiness;
startup has a separate 5-second deadline. Timed-out workers are terminated before
processing another request. Inputs are limited to 10,000 pattern code units and
1,000,000 value code units, with at most 1,024 queued requests. An AbortSignal can
cancel obsolete work. Call `dispose()` when the owner is destroyed. Idle workers
are released after one second. A host whose CSP disallows blob workers may supply
a `workerFactory` implementing the exported `RegexWorker` interface and serving
`REGEX_WORKER_SOURCE` from a permitted origin; there is no main-thread fallback.
The Java-pinned corpus and Chromium, Firefox, and WebKit tests verify semantics,
responsiveness, timeout recovery, and failure when CSP blocks the worker.

Artifact YAML always uses the core scalar rules, including documents explicitly
marked YAML 1.1 or 1.2. Custom tags are rejected on mapping keys as well as values.

`RegexChecks` owns the current regex work for one document or control. Call
`checks.run(() => validate())` for a synchronous report; validators inside that
scope use `RegexChecks.inspect(pattern, value)` and may receive `pending`.
The owner callback runs when the current batch settles. Re-running retains only
current checks and cancels obsolete work; results are bounded to 1,024 entries and
4,000,000 retained UTF-16 code units. `await RegexChecks.validate(() => validate())`
is the asynchronous boundary for a headless consumer. Pending results must block
valid/saveable status without being presented as a malformed answer. Dispose the
checks when their document or control is removed.

## Value validation and save policy

`InstanceValidator.validateReport(instance, template)` returns categorized findings with RFC6901
paths, `structurallyValid`, `canSave`, and `isValid`. The existing `validate` method retains its
`JsonArtifactParsingResult` API, with structural errors and quality warnings. A well-formed answer
outside a numeric bound or another declared constraint has `canSave: true` and `isValid: false`.
Missing structural properties and malformed typed values block saving.

The server judges an instance against the template document as it is stored. An older template can
require fewer children than the model would write, admit further keys through `additionalProperties`,
or require only `@value` of a date or number, and neither this library's model nor the Java one keeps
those facts. A caller holding the stored JSON template passes it as a third argument,
`validateReport(instance, template, storedTemplate)`, and the validator reads them from it. Without
it, the instance is judged against the template as the model writes it.

`TemplateValueValidator.validate(templateOrElementOrField)` checks definition/default consistency
without changing the model. `validateSource(rawDefinition)` supports retained imported definitions
after structural parsing; it does not replace the structural reader. Inconsistent defaults block
template saves. `FieldValuePolicy` supplies the shared local field rules; `ValidationPolicy` supplies
the different template/instance save decisions and is also available from the lightweight `/policy`
entry. Prefer these facts over a host-maintained list of warning codes.

The offline library reports applicable terminology/authority checks as `notChecked`. Hosts resolve
them through the existing services using exact identifiers and complete versioned constraints.
`passed`, `failed`, `notChecked` and `unavailable` are separate outcomes. Uncertainty does not prove
success or invalid membership; the common policy reports it without rejecting an instance.

Java owns the normative value/default, configuration and semantic-verification concordance corpora. Use
`npm run sync:concordance` against committed Java sources, then `npm run test:concordance`. For an
explicitly uncommitted review, `node scripts/sync-concordance.mjs --matrix <name> --working-tree`
records the base commit plus a hash of the actual Java source/test tree. Refresh it after further
Java edits; do not describe that lock as evidence of a committed revision.

### Validate the serialized schema

`SchemaArtifactValidator.structure(json, kind?)` checks a template, element or field before a reader
can normalize it. `validate(json, kind?)` also checks the raw constraints and defaults. Both return the
shared `ValidationSummary`; unknown terminology verification stays advisory for saving. The optional
kind is `template`, `element` or `field`. The lightweight browser entry is
`cedar-model-typescript-library/schema` (`schema.esm.js` for direct module loading).

The structural validators are compiled ahead of time from Java's Draft-04 meta-schemas. To adopt a
canonical change, run `npm run schemas:compile -- --sync /path/to/cedar-model-validation-library`.
The vendored resources, content hashes and generated validators travel together; `npm run schemas:check`
and every package build reject drift. Runtime validation does not compile schemas or evaluate source.
Occurrence counts are limited to Java's nonnegative 32-bit integer range in both the raw checker and
model deployment builders.

The package also carries `conformance/java-oracle.mjs` for consumer test gates. With Java 17 and Maven,
`createJavaOracle(SchemaArtifactValidator.schemaDigests, JsonSourcePolicy.stringify.bind(JsonSourcePolicy))`
starts the real Java validator and mandatory artifact reader, rejects a schema-hash mismatch, and
returns `validate(artifact, kind)` and `close()`. This is test tooling, never a browser dependency.
The Java dependency versions live in `tools/conformance/pom.xml`. CED tests its actual coordinator and
serialized outputs with this oracle; the Designer host tests its final outgoing bodies with it.
The deployed server remains authoritative, including its checks after write-time normalization.
