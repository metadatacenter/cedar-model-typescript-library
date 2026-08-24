# CEDAR Model TypeScript Library 1.0.2 Release

CEDAR Model TypeScript Library 1.0.2 has been published to npm. The library gives TypeScript and JavaScript applications a first-class model of CEDAR metadata — templates, elements, fields, and instances as typed objects, with readers and writers for both JSON and YAML.

Install it from npm as [`cedar-model-typescript-library`](https://www.npmjs.com/package/cedar-model-typescript-library/v/1.0.2).

## Main Features

- **A typed model of every CEDAR artifact.** `Template`, `TemplateElement`, `TemplateField`, and `TemplateInstance` over shared abstract bases, with **25 field types** — 20 that carry values, including ROR, ORCID, DOI, PubMed, RRID, NIH grant ID, and PFAS identifiers, and 5 presentational ones.
- **Child deployment modeled apart from the field itself.** Property IRI, label, cardinality bounds, required, hidden, and value recommendation belong to the deployment, so one field can be deployed into several containers on different terms.
- **Typed values instead of strings.** IRIs, ISO dates, schema and artifact versions, status, temporal granularity and type, time format, numeric type, language, and artifact identifiers.
- **Fluent builders.** Twenty-eight entry points, one per artifact kind and field type, plus a deployment builder for each child.
- **JSON and YAML readers for all four artifact kinds,** with artifact-type detection before a reader is chosen.
- **A parsing result beside every artifact read.** An unknown key, a missing required key, or a wrong-shaped value is reported with its JSON path rather than dropped; unparseable input is refused, not absorbed.
- **YAML writers** emitting both the expanded and the compact form, with canonical scalar style matched to the Java library key by key.
- **Instance inflation.** `InstanceInflater` rebuilds a complete instance from a sparse one and its template — `@context` IRIs, empty slots, child order — which is what makes a YAML-authored instance writable as valid CEDAR JSON.
- **Instance validation.** `InstanceValidator` reports missing required children, broken `minItems`/`maxItems` bounds, and temporal or numeric values lacking their declared `@type`.
- **Round-trip comparison.** Read an artifact, write it back, and report every difference; JSON and YAML comparators locate each one by path.
- **Verified parity with the Java library.** Every build compares 82 shared artifacts: JSON is structurally identical for all 82, and YAML is byte-identical across all 164 expanded and compact outputs.

## Packaging and Quality

- Ships **CommonJS, ES module, and UMD builds** with source maps and TypeScript declarations, with `yaml` as its only runtime dependency.
- Builds and tests on **Node 24**; released under BSD-2-Clause.
- **1297 tests across 89 suites**, coverage floors enforced at 90%, currently 97.4% of lines.
- Every push and pull request runs lint, `tsc --noEmit`, the full suite, both Java parity gates, and a packed-consumer smoke test against the real tarball.

## Changes Since 0.8.0

- **Breaking change:** the boolean field type has been removed.
- Widened the Java parity gate from instances to every artifact kind, and held it at zero divergences.
- Minted property IRIs as the Java library does, percent-encoded as a path segment, rather than deriving them from a child's name.
- Aligned canonical YAML scalar style, value-constraint keys, and multi-select field types with the Java model.
- Added support for numeric and temporal defaults.
- Refused empty identifiers and an empty `pav:derivedFrom` in both readers, while reading legacy occurrence identifiers and legacy empty provenance as declared.
- Corrected instance and artifact identifier placement, YAML `instanceType`, static `_content`, element labels, and `termDisplayLabel` on class constraints.
- Restored the package layout every release through 0.8.0 had, which 1.0.1 lost by publishing from the repository root.
- Reduced the release to one command that builds, smoke-tests the packed consumer, and publishes.

Runnable examples are in the companion [demo repository](https://github.com/metadatacenter/cedar-model-typescript-library-demo).

**Full changelog**: https://github.com/metadatacenter/cedar-model-typescript-library/compare/release-0.8.0...release-1.0.2
