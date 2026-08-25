# CEDAR Model Typescript Library

[![Test](https://github.com/metadatacenter/cedar-model-typescript-library/actions/workflows/test.yml/badge.svg?branch=develop)](https://github.com/metadatacenter/cedar-model-typescript-library/actions/workflows/test.yml)

A library to work with CEDAR templates and instances - implemented in TypeScript

## Build

```shell
npm install
npm run build
```

## Run the tests

```shell
npm test
```

## YAML scalar style

Canonical YAML leaves values plain only for `type`, `modelVersion`, `status`, `version`, `datatype`,
`action`, `granularity`, `termType`, and `inputTimeFormat`, and only when the value belongs to that
field's CEDAR-owned vocabulary. IRIs, timestamps, external vocabularies, and user-authored strings
remain double-quoted. The Java artifact library applies and tests the same policy.

## To regenerate reference file outputs

```shell
# Using CEDAR Artifact Library
npx ts-node ./itest/scripts/regenerate-json-files-with-java-lib.ts
npx ts-node ./itest/scripts/regenerate-yaml-files-with-java-lib.ts

# Using CEDAR Model TypeScript Library
npx ts-node ./itest/scripts/regenerate-json-files-with-ts-lib.ts
npx ts-node ./itest/scripts/regenerate-yaml-files-with-ts-lib.ts

# All files
npx ts-node ./itest/scripts/regenerate-all-files.ts
```

## Compare generated files

```shell
# Regenerates expanded and compact TypeScript instance YAML and fails if any
# of the 21 shared Java/TypeScript outputs differs.
npm run parity:yaml:instances

npx ts-node ./itest/scripts/compare-verbatim-ts-java-yaml-files.ts
npx ts-node ./itest/scripts/compare-verbatim-ref-java-yaml-files.ts
npx ts-node ./itest/scripts/compare-verbatim-ref-ts-yaml-files.ts

npx ts-node ./itest/scripts/compare-content-ref-ts-json-files.ts
npx ts-node ./itest/scripts/compare-content-ref-java-json-files.ts
```

## Development

During development, you might want to use this library in a client project.
To do so, execute this:

```shell
npm run build
npm run link
```

To check the globally installed packages, and check if this library is linked properly, execute:

```shell
npm ls -g --depth=0
```

You should see something similar:

```shell
/opt/homebrew/lib
├── @angular/cli@17.3.0
├── cedar-model-typescript-library@0.8.0 -> ./../../../Users/egyedia/CEDAR/cedar-model-typescript-library/dist
├── ember-cli@5.7.0
├── gulp@4.0.2
├── npm@10.5.0
├── ts-node@10.9.2
└── typescript@5.4.2
```

## Publishing a release

```shell
npm run publish:package
```

This builds, runs the packed-consumer smoke test, and publishes **the `dist` directory** —
not the repository root. The distinction matters, and it is the reason this script exists.

Two manifests describe this package. `package.json` is the development manifest; `build`
copies `package-dist.json` over it as `dist/package.json`, and that is the one consumers
receive. Only the `dist` copy declares `module`, so a release published from the root
reaches bundlers without its ESM entry point and cannot be tree-shaken. Release 1.0.1 went
out that way. It works, but it is not the shape 0.1.0 through 0.8.0 had.

Before publishing, bump the version in `package.json` — `npm run build` propagates it to
`package-dist.json` and refuses the build if the two disagree on the licence.

## See it in action

Check out the README at the companion [demo repo](https://github.com/metadatacenter/cedar-model-typescript-library-demo)
